"""Re-run of the original Colab pipeline (Sem6project.ipynb) plus extra metrics (F1, ROC-AUC, PR-AUC) and a device-held-out split."""
import sys, json, warnings; warnings.filterwarnings("ignore")
import pandas as pd, numpy as np, joblib
from sklearn.model_selection import train_test_split, GroupShuffleSplit
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (accuracy_score, f1_score, precision_score, recall_score,
    roc_auc_score, average_precision_score, confusion_matrix, roc_curve, balanced_accuracy_score)
df = pd.read_csv(sys.argv[1]); mdir = sys.argv[2]
F=[f"metric{i}" for i in range(1,10)]
X=df[F].values
# Same labelling as the Colab notebook (Sem6project.ipynb, CELL 3): "stress" = row mean of the 9 metrics.
stress=df[F].mean(axis=1)
y=np.where(df.failure==1,2,np.where(stress>stress.mean(),1,0))
out={"rows":len(df),"devices":int(df.device.nunique()),"failures":int(df.failure.sum()),
     "class_counts":{int(k):int(v) for k,v in zip(*np.unique(y,return_counts=True))}}
def run(tr,te,name,sc=None):
    sc=sc or StandardScaler().fit(X[tr]); rf=RandomForestClassifier(n_estimators=200,max_features="sqrt",random_state=42,n_jobs=-1).fit(sc.transform(X[tr]),y[tr])
    Xt=sc.transform(X[te]); yt=y[te]; pr=rf.predict(Xt); pp=rf.predict_proba(Xt)
    yb=(yt==2).astype(int); pb=pp[:,list(rf.classes_).index(2)]; predb=(pr==2).astype(int)
    fpr,tpr,_=roc_curve(yb,pb)
    idx=np.linspace(0,len(fpr)-1,min(40,len(fpr))).astype(int)
    r={"test_rows":int(len(te)),"test_failures":int(yb.sum()),
      "multiclass":{"accuracy":accuracy_score(yt,pr),"macro_f1":f1_score(yt,pr,average="macro"),"weighted_f1":f1_score(yt,pr,average="weighted"),
        "roc_auc_ovr_macro":roc_auc_score(yt,pp,multi_class="ovr",average="macro"),
        "per_class":{c:{"precision":precision_score(yt,pr,labels=[i],average=None,zero_division=0)[0],"recall":recall_score(yt,pr,labels=[i],average=None,zero_division=0)[0],"f1":f1_score(yt,pr,labels=[i],average=None,zero_division=0)[0],"support":int((yt==i).sum())} for i,c in enumerate(["Healthy","Medium","Fail"])},
        "confusion":confusion_matrix(yt,pr,labels=[0,1,2]).tolist()},
      "failure":{"precision":precision_score(yb,predb,zero_division=0),"recall":recall_score(yb,predb),"f1":f1_score(yb,predb),"roc_auc":roc_auc_score(yb,pb),"pr_auc":average_precision_score(yb,pb),"balanced_accuracy":balanced_accuracy_score(yb,predb),"confusion":confusion_matrix(yb,predb).tolist(),
        "roc":[[round(float(fpr[i]),4),round(float(tpr[i]),4)] for i in idx]}}
    out[name]=r
    if name=="random_split": out["importance"]=dict(sorted(zip(F,rf.feature_importances_.round(4).tolist()),key=lambda x:-x[1]))
idx=np.arange(len(df))
# Same as notebook: scaler fit on all rows, non-stratified split, random_state=42.
tr,te=train_test_split(idx,test_size=0.2,random_state=42); run(tr,te,"random_split",StandardScaler().fit(X))
tr,te=next(GroupShuffleSplit(n_splits=1,test_size=0.2,random_state=42).split(X,y,groups=df.device)); run(tr,te,"device_split")
print(json.dumps(out,indent=1,default=float))
