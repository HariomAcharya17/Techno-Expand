import sys, json, warnings; warnings.filterwarnings("ignore")
import pandas as pd, numpy as np
from sklearn.model_selection import GroupShuffleSplit
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import f1_score, precision_score, recall_score, roc_auc_score, average_precision_score, confusion_matrix, roc_curve, precision_recall_curve
df = pd.read_csv(sys.argv[1]); df["date"]=pd.to_datetime(df.date); df=df.sort_values(["device","date"]).reset_index(drop=True)
M=[f"metric{i}" for i in [1,2,3,4,5,6,7,9]]
g=df.groupby("device")
feat=df[M].copy()
for m in M:
    feat[m+"_diff"]=g[m].diff().fillna(0)
    feat[m+"_max7"]=g[m].transform(lambda s:s.rolling(7,1).max())
    feat[m+"_mean7"]=g[m].transform(lambda s:s.rolling(7,1).mean())
feat["age_days"]=g.cumcount()
fut=g.failure.transform(lambda s:s[::-1].rolling(7,1).max()[::-1]).astype(int)
y=fut.values; X=feat.values; groups=df.device.values
def model(): return RandomForestClassifier(n_estimators=300,min_samples_leaf=5,class_weight="balanced_subsample",max_features="sqrt",random_state=42,n_jobs=-1)
tr,te=next(GroupShuffleSplit(1,test_size=0.2,random_state=42).split(X,y,groups))
# threshold from inner validation split on train devices
itr,iva=next(GroupShuffleSplit(1,test_size=0.25,random_state=7).split(X[tr],y[tr],groups[tr]))
m=model().fit(X[tr][itr],y[tr][itr]); pv=m.predict_proba(X[tr][iva])[:,1]
p,r,t=precision_recall_curve(y[tr][iva],pv); f=2*p*r/(p+r+1e-9); thr=float(t[np.argmax(f[:-1])])
m=model().fit(X[tr],y[tr]); pt=m.predict_proba(X[te])[:,1]; pred=(pt>=thr).astype(int)
fpr,tpr,_=roc_curve(y[te],pt); idx=np.linspace(0,len(fpr)-1,min(40,len(fpr))).astype(int)
imp=sorted(zip(feat.columns,m.feature_importances_),key=lambda x:-x[1])[:8]
out={"threshold":thr,"test_rows":int(len(te)),"test_failures":int(y[te].sum()),"precision":precision_score(y[te],pred,zero_division=0),"recall":recall_score(y[te],pred),"f1":f1_score(y[te],pred),"roc_auc":roc_auc_score(y[te],pt),"pr_auc":average_precision_score(y[te],pt),"confusion":confusion_matrix(y[te],pred).tolist(),"roc":[[round(float(fpr[i]),4),round(float(tpr[i]),4)] for i in idx],"importance":[[a,round(float(b),4)] for a,b in imp]}
# recall at top-1% alert budget
k=max(1,int(0.01*len(te))); top=np.argsort(-pt)[:k]; out["recall_at_1pct_alerts"]=float(y[te][top].sum()/y[te].sum())
out["positives_total"]=int(y.sum());out["devices_failing"]=int(df.groupby("device").failure.max().sum());print(json.dumps(out,default=float))
