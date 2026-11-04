"use strict";(self.rspackChunk_ml_platform_error_assistant=self.rspackChunk_ml_platform_error_assistant||[]).push([[977],{280(e,t,a){let n,i;a.r(t),a.d(t,{default:()=>ed});var r=a(320),s=a(222),o=a(427),l=a(542),d=a(698),c=a(660),m=a(665),p=a(901),u=a(904);async function f(e,t,a={}){let n,i=p.URLExt.join(t.baseUrl,e);try{n=await u.ServerConnection.makeRequest(i,a,t)}catch(e){throw new u.ServerConnection.NetworkError(e)}let r=await n.text();if(r.length>0)try{r=JSON.parse(r)}catch(e){console.log("Not a JSON response body.",n)}if(!n.ok){let e="string"==typeof r?r:r&&"object"==typeof r&&(r.message||r.error)||n.statusText;throw new u.ServerConnection.ResponseError(n,"string"==typeof e?e:JSON.stringify(e))}return r}let h="modelmind_notebook_type";function g(e){let t=null==e?void 0:e.getMetadata(h);return"trainer"===t||"plain"===t||"practice"===t?t:"modelmind"}function b(e,t){let a=0;for(let n=t;n<e.length;n+=1)if((a+=function(e){let t=0,a=null,n=!1;for(let i of e){if(a){n?n=!1:"\\"===i?n=!0:i===a&&(a=null);continue}'"'===i||"'"===i?a=i:"("===i?t+=1:")"===i&&(t-=1)}return t}(e[n]))<=0)return n;return e.length-1}function x(e){var t;let a=e.split("\n"),n=[];for(let e=0;e<a.length;e+=1){let i=a[e],r=i.match(/^(\s*)if\b.*:\s*$/),s=e+1,o=a[s],l=null==o?void 0:o.match(/^(\s*)raise\b/);if(r&&l&&l[1].length>r[1].length){e=b(a,s);continue}if(l){let i=n.length-1;for(;i>=0&&!n[i].trim();)i-=1;let r=null==(t=n[i])?void 0:t.match(/^(\s*)if\b.*:\s*$/);r&&r[1].length<l[1].length&&n.splice(i),e=b(a,e);continue}n.push(i)}return n.join("\n").replace(/\n{3,}/g,"\n\n")}function _(e){return e.toLowerCase().replace(/\s*\([^)]*\)/g,"").replace(/[^a-z0-9]/g,"").replace(/regressor$/,"regression").replace(/classifier$/,"classification")}function v(e){var t;let a=JSON.stringify(e),n=null==(t=e.split(/[?#]/,1)[0].split(".").pop())?void 0:t.toLowerCase();return`import pandas as pd

df = pd.${"xlsx"===n||"xls"===n?"read_excel":"json"===n?"read_json":"read_csv"}(${a})
print(f"Loaded dataset: {df.shape[0]} rows \xd7 {df.shape[1]} columns")`}let y={"linear regression":{classification:"Fits a linear combination of features to predict a numeric target.",regression:"Fits a linear relationship between the input features and numeric target, providing a clear baseline.",strengths:["Simple, fast baseline","Coefficients are straightforward to inspect"],weaknesses:["Cannot model nonlinear patterns without feature engineering","Sensitive to outliers and correlated features"],bestFor:"Numeric targets with approximately linear feature relationships.",trainingSpeed:"Fast",complexity:"Low",interpretability:"High"},"ridge regression":{classification:"Uses L2-regularized linear scores to separate classes.",regression:"Adds L2 regularization to linear regression, shrinking coefficients to stabilize correlated or numerous features.",strengths:["Regularization can stabilize correlated features","Fast linear baseline"],weaknesses:["Still assumes a linear relationship","Does not usually remove features entirely"],bestFor:"Numeric targets with mostly linear structure and correlated features.",trainingSpeed:"Fast",complexity:"Low",interpretability:"High"},"lasso regression":{classification:"Uses L1-regularized linear scores to separate classes.",regression:"Uses L1 regularization, which can shrink weak linear coefficients to zero and produce a sparse model.",strengths:["Can create sparse feature sets","Fast linear model"],weaknesses:["May be unstable with strongly correlated features","Cannot learn nonlinear relationships by itself"],bestFor:"Approximately linear numeric targets where a compact set of predictors is useful.",trainingSpeed:"Fast",complexity:"Low",interpretability:"High"},"elastic net":{classification:"Combines L1 and L2 regularization for a linear classification boundary.",regression:"Combines L1 and L2 regularization to balance sparse coefficients with stability across correlated predictors.",strengths:["Balances sparsity and coefficient stability","Useful when predictors are correlated"],weaknesses:["Requires tuning regularization strength and mix","Assumes a linear relationship"],bestFor:"Linear numeric problems with many or correlated features.",trainingSpeed:"Fast",complexity:"Low–Medium",interpretability:"High"},"logistic regression":{classification:"Estimates class probabilities from a regularized linear decision boundary, making it a strong, efficient classification baseline.",regression:"Uses a linear score for numeric predictions.",strengths:["Fast probability-based classification baseline","Coefficients are inspectable"],weaknesses:["Linear boundary can miss nonlinear class structure","May need feature scaling and feature engineering"],bestFor:"Classification with a roughly linear class boundary or when probability estimates are useful.",trainingSpeed:"Fast",complexity:"Low",interpretability:"High"},"ridge classifier":{classification:"Applies L2 regularization to a linear decision function, discouraging overly large coefficients while keeping the model fast and relatively simple.",regression:"Uses regularized linear scores for numeric prediction.",strengths:["Regularization helps with many or correlated features","Efficient linear classifier"],weaknesses:["Decision boundary is linear","Does not provide calibrated probabilities by default"],bestFor:"A fast linear classification baseline when a simpler decision rule is useful.",trainingSpeed:"Fast",complexity:"Low",interpretability:"High"},"decision tree":{classification:"Builds threshold-based if/then splits that can represent nonlinear boundaries and feature interactions without requiring feature scaling.",regression:"Builds threshold-based if/then splits that can represent nonlinear target patterns without requiring feature scaling.",strengths:["Captures nonlinear patterns and interactions","Rules are relatively easy to visualize"],weaknesses:["A single tree can vary substantially with small data changes","Deep trees can overfit"],bestFor:"Nonlinear tabular data when rule-like decisions and little preprocessing are valuable.",trainingSpeed:"Fast",complexity:"Low–Medium",interpretability:"High"},"random forest":{classification:"Averages many bootstrapped decision trees, reducing the instability of a single tree while learning nonlinear interactions.",regression:"Averages many bootstrapped decision trees, reducing the variance of a single tree for nonlinear numeric patterns.",strengths:["Captures nonlinear patterns with reduced single-tree variance","Usually works without feature scaling"],weaknesses:["Less transparent than one tree","Model size and training time grow with the forest"],bestFor:"General-purpose nonlinear tabular prediction where robustness is more important than a single compact rule set.",trainingSpeed:"Moderate",complexity:"Medium",interpretability:"Low–Medium"},"extra trees":{classification:"Averages trees built with extra-randomized split thresholds; this decorrelation can reduce variance while retaining nonlinear decision boundaries.",regression:"Averages trees built with extra-randomized split thresholds; the additional randomness can reduce variance in nonlinear regression.",strengths:["Randomized trees capture nonlinear patterns","Ensembling can make predictions less sensitive to one tree"],weaknesses:["Individual decisions are difficult to explain","Randomized splits can trade some fit for lower variance"],bestFor:"Nonlinear tabular data where a fast, randomized tree ensemble is worth testing.",trainingSpeed:"Moderate–Fast",complexity:"Medium",interpretability:"Low"},"gradient boosting":{classification:"Adds shallow trees sequentially, with later trees correcting errors from earlier ones; this can capture structured nonlinearities.",regression:"Adds trees sequentially to reduce prior prediction errors, fitting nonlinear numeric patterns through a series of small corrections.",strengths:["Learns nonlinear patterns through sequential corrections","Can perform well on structured tabular data"],weaknesses:["Learning rate and tree count need care","Can overfit and is usually slower than simple baselines"],bestFor:"Tabular data with nonlinear structure when a carefully regularized boosted-tree model is useful.",trainingSpeed:"Moderate",complexity:"Medium–High",interpretability:"Low"},"hist gradient boosting":{classification:"Uses histogram-binned gradient-boosted trees to model nonlinear patterns efficiently on larger tabular datasets.",regression:"Uses histogram-binned gradient-boosted trees to model nonlinear numeric patterns efficiently on larger tabular datasets.",strengths:["Histogram binning can speed up boosted-tree training","Learns nonlinear feature interactions"],weaknesses:["Less transparent than linear models or a shallow tree","Performance depends on depth, leaves, and regularization"],bestFor:"Medium-to-large tabular datasets with nonlinear relationships where efficient boosting is useful.",trainingSpeed:"Moderate–Fast",complexity:"Medium–High",interpretability:"Low"},"k nearest neighbors":{classification:"Predicts from nearby training examples, so it can capture local patterns without fitting a global decision formula.",regression:"Predicts from nearby training examples, so it can represent local rather than global numeric patterns.",strengths:["Simple, flexible local decision rule","Few assumptions about the global shape of the data"],weaknesses:["Requires feature scaling","Prediction can be slow and sensitive to irrelevant features"],bestFor:"Smaller datasets where similarity in a well-scaled feature space is meaningful.",trainingSpeed:"Fast fit; slower predict",complexity:"Low",interpretability:"Medium"},"linear svm":{classification:"Finds a linear class boundary with a wide margin; it is a useful comparison when a simple linear separator may fit the task.",regression:"Uses a linear support-vector boundary for numeric prediction.",strengths:["Can provide a compact linear decision boundary","Margin regularization controls model flexibility"],weaknesses:["Cannot learn nonlinear boundaries without feature transformations","Requires feature scaling and careful regularization"],bestFor:"Classification where a scaled, linear decision boundary is a reasonable baseline.",trainingSpeed:"Moderate",complexity:"Medium",interpretability:"Low–Medium"},"rbf svm":{classification:"Uses a radial-basis kernel to form nonlinear class boundaries when a linear separator is too restrictive.",regression:"Uses an RBF kernel to fit smooth nonlinear numeric relationships.",strengths:["Can model nonlinear boundaries","Effective on small-to-medium datasets with scaled features"],weaknesses:["Requires feature scaling and tuning of C/gamma","Training can become costly as row count grows"],bestFor:"Small-to-medium datasets with nonlinear structure and meaningful scaled distances.",trainingSpeed:"Moderate–Slow",complexity:"Medium–High",interpretability:"Low"},"support vector regression":{classification:"Uses a support-vector margin for classification.",regression:"Fits an RBF support-vector function with an epsilon-insensitive loss, allowing nonlinear regression while controlling margin complexity.",strengths:["Can model smooth nonlinear numeric patterns","Epsilon loss ignores small residuals"],weaknesses:["Requires feature scaling and C/epsilon tuning","Training can be slow on large datasets"],bestFor:"Small-to-medium numeric datasets with smooth nonlinear relationships.",trainingSpeed:"Moderate–Slow",complexity:"Medium–High",interpretability:"Low"},"gaussian naive bayes":{classification:"Estimates class likelihoods under a conditional-independence and per-feature Gaussian assumption, making it a fast probabilistic baseline.",regression:"Uses a Gaussian likelihood model for classification-style prediction.",strengths:["Very fast and works with small datasets","Provides class probabilities"],weaknesses:["Conditional-independence and Gaussian assumptions may be inaccurate","Correlated features can reduce effectiveness"],bestFor:"Fast classification baselines, especially when feature likelihood assumptions are reasonable.",trainingSpeed:"Very fast",complexity:"Low",interpretability:"Medium"},"xgboost classifier":{classification:"Uses regularized gradient-boosted trees with efficient histogram training to learn nonlinear class boundaries and feature interactions.",regression:"Uses regularized gradient-boosted trees for numeric prediction.",strengths:["Flexible nonlinear tabular model","Regularization and subsampling offer overfit controls"],weaknesses:["More parameters to tune and less transparent than simple models","Requires the optional XGBoost package"],bestFor:"Structured classification data where a regularized boosted-tree model is worth comparing against simpler baselines.",trainingSpeed:"Moderate–Fast",complexity:"High",interpretability:"Low"},"xgboost regressor":{classification:"Uses regularized gradient-boosted trees for classification.",regression:"Uses regularized gradient-boosted trees to learn nonlinear numeric patterns, with depth, learning rate, and regularization controlling model complexity.",strengths:["Flexible nonlinear tabular model","Regularization and subsampling offer overfit controls"],weaknesses:["More parameters to tune and less transparent than simple models","Requires the optional XGBoost package"],bestFor:"Structured numeric prediction where a regularized boosted-tree model is worth comparing against simpler baselines.",trainingSpeed:"Moderate–Fast",complexity:"High",interpretability:"Low"}},w={"linear regression":"Fits a simple linear relationship to the target.","ridge regression":"Fits a linear relationship with extra protection against unstable weights.","lasso regression":"Fits a linear relationship and can remove weak predictors.","elastic net":"Balances feature selection and stable linear predictions.","logistic regression":"Predicts class probabilities with a linear decision boundary.","ridge classifier":"Uses a regularized linear boundary to separate classes.","decision tree":"Learns readable if/then rules and nonlinear patterns.","random forest":"Combines many trees to learn nonlinear patterns more reliably.","extra trees":"Combines randomized trees to learn nonlinear patterns.","gradient boosting":"Adds small trees that correct earlier prediction errors.","hist gradient boosting":"Uses efficient boosted trees to learn nonlinear patterns.","k nearest neighbors":"Predicts from the most similar training examples.","linear svm":"Finds a strong linear boundary between classes.","rbf svm":"Uses a kernel to model nonlinear class boundaries.","support vector regression":"Fits a smooth function for numeric predictions.","gaussian naive bayes":"Estimates class probabilities from feature distributions.","xgboost classifier":"Uses regularized boosted trees to learn class patterns and interactions.","xgboost regressor":"Uses regularized boosted trees to learn numeric patterns and interactions."};function C(e,t){let a,n=(a=e.trim().toLowerCase().replace(/[-_]/g," ")).includes("extra tree")||a.includes("extratrees")?"extra trees":a.includes("random forest")||a.includes("randomforest")?"random forest":a.includes("xgboost classifier")||a.includes("xgbclassifier")?"xgboost classifier":a.includes("xgboost regressor")||a.includes("xgbregressor")?"xgboost regressor":a.includes("xgboost")||a.includes("xgb")?"xgboost":a.includes("hist gradient")||a.includes("histgradient")?"hist gradient boosting":a.includes("gradient boost")||a.includes("gradientboost")?"gradient boosting":a.includes("decision tree")||a.includes("decisiontree")?"decision tree":a.includes("logistic")?"logistic regression":a.includes("ridge classifier")?"ridge classifier":a.includes("ridge")?"ridge regression":a.includes("lasso")?"lasso regression":a.includes("elastic net")||a.includes("elasticnet")?"elastic net":a.includes("linear regression")?"linear regression":a.includes("linear svm")||a.includes("linear svc")||a.includes("linearsvc")?"linear svm":a.includes("rbf svm")||a.includes("rbf svc")||a.includes("svc")?"rbf svm":a.includes("svr")||a.includes("support vector regression")?"support vector regression":a.includes("naive bayes")||a.includes("gaussiannb")?"gaussian naive bayes":a.includes("knn")||a.includes("neighbors")||a.includes("k nearest")?"k nearest neighbors":a,i="regression"===t.task,r=function(e){if(!e)return"the target";let t=e.replace(/[_-]+/g," ").trim();return`“${t}”`}(t.targetColumn);switch(n){case"linear regression":return[`Learns direct linear relationships between input features and ${r}.`,"High interpretability: regression coefficients clearly reveal the direction and magnitude of each feature’s effect.","Exceptionally fast training and inference with minimal computational footprint.","Low model complexity minimizes the risk of overfitting when data is limited or linear patterns dominate.","Serves as a transparent benchmark against which more complex nonlinear models can be evaluated."];case"ridge regression":return[`Applies L2 weight penalty to stabilize linear coefficients and prevent overfitting on ${r}.`,"Effectively handles multicollinearity (correlated features) without inflating prediction variance.","Retains linear interpretability while improving out-of-fold generalization on noisy data.","Fast closed-form computation making it ideal for quick iterations on tabular datasets.","Provides a more resilient linear baseline than standard OLS when many features are present."];case"lasso regression":return["Utilizes L1 regularization to automatically drive uninformative feature coefficients to zero.","Performs built-in feature selection, creating a simpler, sparser, and more explainable model.","Constrains total weight magnitude to buffer against overfitting on small or noisy datasets.",`High interpretability: zeroes out weak predictors to highlight key drivers of ${r}.`,"Fast linear baseline well-suited when you expect only a subset of features to be predictive."];case"elastic net":return["Combines L1 and L2 regularization to simultaneously perform feature selection and stabilize correlated predictors.","Overcomes Lasso’s limitations by selecting groups of correlated features together.","Balances model sparsity with generalization stability on multi-feature tabular data.","Controls model complexity to guard against overfitting on small-to-medium datasets."];case"logistic regression":return["Directly estimates calibrated class probabilities using a regularized linear decision boundary.","High interpretability: odds ratios and coefficients clearly explain each feature’s contribution to class outcomes.","Fast to train and evaluate with low memory overhead and no risk of complex tree memorization.","Built-in regularization (L2/L1) guards against overfitting on tabular classification tasks.","Serves as the gold-standard linear baseline for binary and multiclass classification."];case"ridge classifier":return["Uses L2-regularized linear decision functions to classify examples rapidly and stably.","Highly resilient against multicollinear features and high dimensionality without exploding weights.","Significantly faster than iterative logistic solvers on large tabular splits.","Low complexity prevents overfitting on small or moderately sized training sets.","Provides a clear linear benchmark to evaluate if complex tree ensembles are truly needed."];case"decision tree":if(i)return[`Partitions feature space into piecewise constant regions to capture complex nonlinear trends in ${r}.`,"Highly visual and interpretability: every prediction can be verified step-by-step from root to leaf.","Requires no feature scaling and remains invariant to monotonic feature transformations.","Naturally models multi-feature interaction effects without requiring interaction terms.","Serves as an intuitive nonlinear baseline for tabular regression."];return["Learns human-readable if/then decision rules that make predictions transparent and easy to trace.","Naturally captures nonlinear decision boundaries and hierarchical feature interactions without manual transformations.","Requires zero feature scaling, normalization, or centering of numeric columns.","Handles mixed numeric and categorical inputs with intuitive hierarchical splits.","Provides clear feature importance rankings based on split impurity reduction."];case"random forest":if(i)return[`Captures nonlinear relationships between input features and ${r}.`,"Handles complex interactions between multiple features without manual transformations.","Requires relatively little feature scaling or normalization.","Is a strong baseline for structured tabular datasets.","Aggregates diverse decision trees via bagging to reduce variance and provide feature importance estimates."];return["Captures nonlinear decision boundaries and feature interactions without manual transformation.","Ensembles hundreds of decision trees via bagging to suppress variance and avoid single-tree overfitting.","Requires minimal feature scaling and handles numeric and encoded categorical features smoothly.","Robust against noise, outliers, and varying class distributions in tabular data.","Provides reliable class probabilities and interpretable feature importance rankings."];case"extra trees":if(i)return["Ensembles deeply randomized decision trees, creating smoother response surfaces than standard bagging.","Reduces model variance and combats overfitting through randomized split thresholds.","Trains faster than standard Random Forest because optimal split thresholds are drawn at random.","Requires no feature scaling and is highly robust against extreme numeric outliers.","Captures intricate nonlinear feature interactions across tabular columns."];return["Combines randomized decision trees to learn complex nonlinear class boundaries.","Randomized split thresholds further suppress variance and reduce the risk of overfitting.","Trains faster than standard bagging while maintaining competitive classification accuracy.","Requires minimal feature scaling and is robust against noisy features.","Computes robust out-of-fold predictions and feature importance estimates."];case"gradient boosting":if(i)return["Sequentially builds trees that directly correct the residual prediction errors of previous trees.",`Excels at capturing subtle nonlinear relationships and continuous response curves for ${r}.`,"Employs shrinkage (learning rate) and subsampling to achieve strong generalization accuracy.","Learns complex multi-way feature interactions automatically.","Proven, high-accuracy benchmark for structured tabular regression."];return["Iteratively corrects misclassified samples and residual errors with targeted sequential trees.","Learns intricate nonlinear decision boundaries and high-order feature interactions.","Learning rate shrinkage and tree depth limits help guard against overfitting.","Consistently delivers superior predictive performance on tabular classification problems.","Generates fine-grained class probabilities and feature importance metrics."];case"hist gradient boosting":if(i)return["Discretizes continuous features into 256 histogram bins, accelerating training speed by 10x–50x.","Native out-of-the-box handling of missing values without requiring manual imputation pipelines.",`Captures complex nonlinear curves and multi-feature interaction effects with high accuracy for ${r}.`,"Low memory footprint and early stopping make it highly scalable for larger tabular datasets."];return["Uses histogram-based feature binning for dramatically faster training on tabular data.","Built-in native support for missing values in features during both training and inference.","Learns complex nonlinear interactions while maintaining state-of-the-art boosted tree accuracy.","Highly memory-efficient and scalable for medium to large-scale classification tasks."];case"xgboost classifier":case"xgboost":if(i)return["Industry-standard boosted tree framework utilizing second-order gradients for precise split finding.","Employs L1 and L2 tree-leaf regularization to penalize model complexity and prevent overfitting.",`Captures complex nonlinear patterns and multi-feature interactions in ${r}.`,"Robust to missing values and requires zero monotonic feature scaling.","Consistently achieves top-tier accuracy and generalization on tabular regression benchmarks."];return["State-of-the-art gradient boosting framework with second-order Taylor expansions for optimal splits.","Advanced L1 and L2 regularization across tree leaves actively suppresses overfitting.","Handles complex nonlinear decision boundaries and multi-feature interactions seamlessly.","Native missing value handling and column subsampling enhance resilience against noisy features.","Consistently top-ranking performer for tabular classification in real-world applications."];case"xgboost regressor":return["Industry-standard boosted tree framework utilizing second-order gradients for precise split finding.","Employs L1 and L2 tree-leaf regularization to penalize model complexity and prevent overfitting.",`Captures complex nonlinear patterns and multi-feature interactions in ${r}.`,"Robust to missing values and requires zero monotonic feature scaling.","Consistently achieves top-tier accuracy and generalization on tabular regression benchmarks."];case"k nearest neighbors":if(i)return["Predicts continuous values by averaging the target values of the k nearest feature neighbors.","Adapts locally to arbitrary continuous functions without imposing a global functional form.","Zero training phase (lazy learner), making model updates instantaneous when new data arrives.","Effective when similar input profiles reliably correspond to similar target values."];return["Instance-based classification: predicts class labels based on proximity to the k closest training examples.","Makes zero assumptions about the underlying distribution or linearity of the data.","Naturally handles multi-class targets and complex, irregular decision clusters.","Transparent reasoning: predictions can be directly explained by inspecting nearest neighbor samples."];case"linear svm":return["Maximizes the geometric margin between classes, optimizing for best worst-case boundary generalization.","Highly effective in high-dimensional feature spaces with many predictors.","Memory-efficient: decision boundary depends strictly on a small subset of critical support vectors.","Regularization parameter (C) provides explicit control over margin width and outlier tolerance."];case"rbf svm":return["Uses the Radial Basis Function kernel to separate classes with intricate, nonlinear boundaries.","Excels when decision boundaries are curved or form complex geometric clusters in feature space.","Robust against moderate noise when kernel bandwidth and regularization are tuned.","Powerful modeling capability for small to medium-sized structured tabular datasets."];case"support vector regression":return["Uses an epsilon-insensitive loss function: errors within the epsilon tube are ignored, reducing sensitivity to noise.","Effective at modeling smooth nonlinear trends using kernel transformations.","Memory-efficient model defined strictly by key support vectors rather than the entire dataset.","Robust against outliers compared to standard least-squares regression."];case"gaussian naive bayes":return["Extremely fast probabilistic classifier based on Bayes’ theorem with feature independence assumptions.","Requires very small amounts of training data to estimate mean and variance parameters.","Highly immune to the curse of dimensionality with negligible memory and CPU consumption.","Serves as a rapid, lightweight baseline for continuous numeric features."];default:return["Evaluated with cross-validation on the selected dataset and evaluation metric.",`Learns representative patterns from the input features to predict ${r}.`,"Provides a competitive alternative benchmark among the evaluated model finalists."]}}let k={alpha:"Controls coefficient regularization; larger values penalize model complexity more strongly.",ccp_alpha:"Controls cost-complexity pruning; larger values prune more of the tree.",C:"Inverse regularization strength; smaller values apply stronger regularization.",class_weight:"Can give minority classes more influence when class frequencies are uneven.",colsample_bytree:"Controls the fraction of input features sampled for each boosted tree.",epsilon:"Sets the error-insensitive margin in support-vector regression.",gamma:"Controls the reach of the RBF kernel; larger values make its influence more local.",l1_ratio:"Sets the blend between L1 sparsity and L2 coefficient shrinkage.",learning_rate:"Controls each boosting step; smaller steps often need more trees.",max_depth:"Limits tree depth and therefore the complexity of learned decision rules.",max_features:"Limits the features considered for a tree split, affecting diversity and fit.",max_iter:"Sets the number of boosting iterations or optimization steps.",max_leaf_nodes:"Limits the number of leaves and therefore tree complexity.",max_samples:"Controls the number or fraction of training rows sampled for an ensemble.",min_samples_leaf:"Requires a minimum number of examples at each leaf, which can smooth predictions.",min_samples_split:"Requires a minimum number of examples before a node can split.",n_estimators:"Sets how many trees are combined in the ensemble.",n_neighbors:"Sets how many nearby training examples contribute to a K-nearest-neighbor prediction.",p:"Chooses the Minkowski distance: 1 is Manhattan distance and 2 is Euclidean distance.",reg_lambda:"Controls L2 regularization of boosted-tree weights.",subsample:"Controls the fraction of training rows sampled for each boosting step.",var_smoothing:"Adds stability to small feature variances in Gaussian Naive Bayes.",weights:"Distance weighting gives closer neighbors more influence than equally weighted neighbors."};class E extends c.Widget{constructor(e,t){var a;super(),this._activeTab="xray",this._currentPath="50_Startups.csv",this._resolvedDatasetPath="",this._dataset=null,this._prepLevel="basic",this._trainerMode=!1,this._notebookRole="modelmind",this._preprocessingRequestId=0,this._targetCol="",this._featureCol="",this._tabButtons=new Map,this._app=e,this._notebooks=t,this._notebookRole=g(null==(a=t.currentWidget)?void 0:a.context.model),this._trainerMode="trainer"===this._notebookRole,this.id="modelmind-studio-sidebar",this.title.caption="ModelMind Studio",this.title.iconClass="mm-sidebar-icon mm-icon-modelmind",this.addClass("mm-modelmind-panel"),this._root=document.createElement("div"),this._root.className="mm-studio-root",this.node.appendChild(this._root),this._buildHeader(),this._buildTabs(),this._buildContentArea(),this._bindNotebookTracker(),this._refreshNotebookModeWhenReady(),setTimeout(()=>{this._canUseCodeAction("preview")&&this._loadDataset(this._currentPath)},100)}_buildHeader(){var e;let t=document.createElement("div");t.className="mm-studio-header";let a=document.createElement("div");a.className="mm-studio-brand",a.innerHTML=`
      <div class="mm-studio-logo">◈</div>
      <div class="mm-studio-title-box">
        <div class="mm-studio-title">ModelMind Studio</div>
        <div class="mm-studio-sub">AI ML Intelligence & Laboratory</div>
      </div>
    `,this._notebookModeLabel=document.createElement("div"),this._notebookModeLabel.className="mm-studio-sub",this._notebookModeLabel.textContent=this._trainerMode?"Trainer Notebook \xb7 Preview only":"ModelMind Notebook",null==(e=a.querySelector(".mm-studio-title-box"))||e.appendChild(this._notebookModeLabel);let n=document.createElement("div");n.className="mm-studio-path-wrap";let i=document.createElement("div");i.className="mm-studio-input-row",this._pathInput=document.createElement("input"),this._pathInput.type="text",this._pathInput.className="mm-studio-input",this._pathInput.placeholder="e.g. 50_Startups.csv",this._pathInput.value=this._currentPath;let r=document.createElement("button");r.type="button",r.className="mm-studio-btn mm-btn-primary",r.innerHTML="\uD83D\uDD0D Analyze",r.title="Analyze Dataset",r.addEventListener("click",()=>{let e=this._pathInput.value.trim();e&&this._loadDataset(e)}),i.append(this._pathInput,r);let s=document.createElement("div");s.className="mm-studio-quick-row";let o=document.createElement("button");o.type="button",o.className="mm-studio-quick-pill",o.innerHTML="⚡ Auto-Detect",o.title="Detect dataset from open notebook cell",o.addEventListener("click",()=>this._autoDetectDataset());let l=document.createElement("button");l.type="button",l.className="mm-studio-quick-pill",l.textContent="50_Startups.csv",l.addEventListener("click",()=>{this._pathInput.value="50_Startups.csv",this._loadDataset("50_Startups.csv")});let d=document.createElement("button");d.type="button",d.className="mm-studio-quick-pill",d.textContent="test_dataset.csv",d.addEventListener("click",()=>{this._pathInput.value="test_dataset.csv",this._loadDataset("test_dataset.csv")}),s.append(o,l,d),this._statusPill=document.createElement("div"),this._statusPill.className="mm-studio-status-pill",this._statusPill.textContent="Ready to analyze",n.append(i,s,this._statusPill),t.append(a,n),this._root.appendChild(t)}_buildTabs(){this._tabRow=document.createElement("div"),this._tabRow.className="mm-studio-tab-bar",[{id:"xray",label:"\uD83D\uDD2C X-Ray"},{id:"target",label:"\uD83C\uDFAF Target"},{id:"feature",label:"\uD83D\uDCCA Feature"},{id:"prep",label:"\uD83E\uDDE0 Preprocessing"},{id:"model-advisor",label:"\uD83E\uDD16 Model Advisor"},{id:"lab",label:"⚗️ Model Lab"},{id:"guide",label:"\uD83D\uDCD6 Guide"}].forEach(e=>{let t=document.createElement("button");t.type="button",t.className=`mm-studio-tab ${e.id===this._activeTab?"active":""}`,t.textContent=e.label,t.addEventListener("click",()=>{this._activeTab=e.id,this._tabButtons.forEach((t,a)=>{t.classList.toggle("active",a===e.id)}),this._renderCurrentTab()}),this._tabRow.appendChild(t),this._tabButtons.set(e.id,t)}),this._root.appendChild(this._tabRow)}_buildContentArea(){this._contentArea=document.createElement("div"),this._contentArea.className="mm-studio-content",this._root.appendChild(this._contentArea)}_bindNotebookTracker(){this._notebooks.currentChanged.connect(()=>{this._refreshNotebookModeWhenReady()}),this._notebooks.activeCellChanged.connect(()=>{let e=this._notebooks.activeCell;if(!e||!(0,r.isCodeCellModel)(e.model))return;let t=e.model.toJSON().source,a=(Array.isArray(t)?t.join(""):t).match(/['"]((?:[^'"]+)\.(?:csv|xlsx|xls|json))['"]/);if(a){let e=a[1];e&&e!==this._currentPath&&(this._pathInput.value=e)}})}async _refreshNotebookModeWhenReady(){let e=this._notebooks.currentWidget;e&&(await e.context.ready,e!==this._notebooks.currentWidget)||this.refreshNotebookMode()}refreshNotebookMode(){var e,t;let a=g(null==(e=this._notebooks.currentWidget)?void 0:e.context.model);a!==this._notebookRole&&(this._notebookRole=a,this._trainerMode="trainer"===a,this._notebookModeLabel.textContent="trainer"===a?"Trainer Notebook \xb7 Preview only":"plain"===a?"Plain ModelMind Notebook":"ModelMind Notebook",null==(t=document.getElementById("mm-code-preview-modal"))||t.remove(),this._renderCurrentTab())}_canUseCodeAction(e){var t;return t=this._notebookRole,"plain"!==t&&("trainer"!==t||"preview"===e)}_autoDetectDataset(){if(!this._canUseCodeAction("preview"))return;let e=this._notebooks.activeCell;if(!e||!(0,r.isCodeCellModel)(e.model))return void this._showToast("Select a notebook cell containing dataset path.");let t=e.model.toJSON().source,a=(Array.isArray(t)?t.join(""):t).match(/['"]((?:[^'"]+)\.(?:csv|xlsx|xls|json))['"]/);a?(this._pathInput.value=a[1],this._loadDataset(a[1]),this._showToast(`Auto-detected: ${a[1]}`)):this._showToast("No .csv/.xlsx/.json found in active cell.")}async _loadDataset(e){var t,a,n;if(this._canUseCodeAction("preview")){this._currentPath=e,this._statusPill.textContent="⏳ Analyzing dataset...",this._statusPill.className="mm-studio-status-pill loading";try{let i=await f("api/dataset/xray",this._app.serviceManager.serverSettings,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({file_path:e})});if(this._dataset=i,!i.supported){this._statusPill.textContent=`❌ ${i.message||"Dataset not supported"}`,this._statusPill.className="mm-studio-status-pill error",this._renderError(i.message||"Dataset format not supported.");return}let r=null!=(t=i.rows)?t:0,s=null!=(a=i.columns)?a:0,o=null!=(n=i.total_missing_values)?n:0;this._statusPill.textContent=`✓ ${i.filename||e}: ${r} rows \xd7 ${s} cols • ${o} missing`,this._statusPill.className="mm-studio-status-pill success",i.column_names&&i.column_names.length>0&&(this._targetCol&&i.column_names.includes(this._targetCol)||(this._targetCol=i.column_names[i.column_names.length-1]),this._featureCol&&i.column_names.includes(this._featureCol)||(this._featureCol=i.column_names[0])),this._renderCurrentTab()}catch(t){let e=t instanceof Error?t.message:"Failed to load dataset";this._statusPill.textContent=`❌ Error: ${e}`,this._statusPill.className="mm-studio-status-pill error",this._renderError(e)}}}_renderError(e){this._contentArea.replaceChildren();let t=document.createElement("div");t.className="mm-studio-card mm-card-error",t.innerHTML=`
      <div style="font-weight:700; font-size:13px; margin-bottom:6px;">⚠️ Dataset Error</div>
      <div style="font-size:11px; opacity:.9;">${e}</div>
      <div style="font-size:10px; opacity:.6; margin-top:8px;">Ensure the file exists in the workspace. Supported: .csv, .xlsx, .json</div>
    `,this._contentArea.appendChild(t)}_renderCurrentTab(){switch(this._contentArea.replaceChildren(),this._activeTab){case"xray":this._renderXRayTab();break;case"target":this._renderTargetTab();break;case"feature":this._renderFeatureTab();break;case"prep":this._renderPreprocessingTab();break;case"model-advisor":this._renderModelAdvisorTab();break;case"lab":this._renderModelLabTab();break;case"guide":this._renderGuideTab()}}_renderXRayTab(){var e,t,a,n,i,r,s,o;if(!this._dataset||!this._dataset.supported){this._contentArea.innerHTML='<div class="mm-studio-empty">Enter a dataset file path above and click \uD83D\uDD0D Analyze.</div>';return}let l=this._dataset,d=document.createDocumentFragment(),c=document.createElement("div");c.className="mm-studio-section",c.innerHTML=`<div class="mm-studio-sec-title"><span>🔬</span> Dataset Health Profile</div>`;let m=document.createElement("div");m.className="mm-studio-stats-grid";let p=null!=(t=null==(e=l.numeric_columns)?void 0:e.length)?t:0,u=null!=(n=null==(a=l.categorical_columns)?void 0:a.length)?n:0,f=null!=(i=l.total_missing_values)?i:0,h=null!=(r=l.duplicate_rows)?r:0;if(m.appendChild(this._createStatCard("Rows",null!=(s=l.rows)?s:0)),m.appendChild(this._createStatCard("Columns",`${null!=(o=l.columns)?o:0} (${p}N / ${u}C)`)),m.appendChild(this._createStatCard("Missing",f,f>0?"warn":"ok")),m.appendChild(this._createStatCard("Duplicates",h,h>0?"warn":"ok")),c.appendChild(m),l.likely_id_columns&&l.likely_id_columns.length>0){let e=document.createElement("div");e.className="mm-studio-alert mm-alert-warning",e.innerHTML=`⚠️ <b>Likely ID Column(s):</b> ${l.likely_id_columns.join(", ")} — These should not be used as training features.`,c.appendChild(e)}if(d.appendChild(c),l.missing_values&&Object.keys(l.missing_values).length>0){let e=Object.entries(l.missing_values).filter(([,e])=>e>0);if(e.length>0){let t=document.createElement("div");t.className="mm-studio-section",t.innerHTML='<div class="mm-studio-sec-title"><span>⚠️</span> Missing Values Breakdown</div>',e.forEach(([e,a])=>{let n=l.rows?Math.round(a/l.rows*100):0,i=document.createElement("div");i.className="mm-studio-bar-row",i.innerHTML=`
            <div class="mm-studio-bar-label">
              <span>${e}</span>
              <span class="mm-studio-bar-val">${a} (${n}%)</span>
            </div>
            <div class="mm-studio-bar-track">
              <div class="mm-studio-bar-fill" style="width:${n}%; background:#f87171;"></div>
            </div>
          `,t.appendChild(i)}),d.appendChild(t)}}if(l.preview&&l.preview.length>0){let e=document.createElement("div");e.className="mm-studio-section",e.innerHTML=`<div class="mm-studio-sec-title"><span>👁️</span> Data Preview (First 5 Rows)</div>`;let t=document.createElement("div");t.className="mm-studio-table-wrap";let a=document.createElement("table");a.className="mm-studio-table";let n=l.column_names||Object.keys(l.preview[0]||{}),i=document.createElement("thead"),r=document.createElement("tr");n.forEach(e=>{var t;let a=document.createElement("th"),n=(null==(t=l.dtypes)?void 0:t[e])||"";a.innerHTML=`<div>${e}</div><span class="mm-th-dtype">${n}</span>`,r.appendChild(a)}),i.appendChild(r),a.appendChild(i);let s=document.createElement("tbody");l.preview.slice(0,5).forEach((e,t)=>{let a=document.createElement("tr");n.forEach(t=>{let n=document.createElement("td"),i=e[t];n.textContent=null!=i?String(i):"—",null==i&&(n.style.color="#ef4444"),a.appendChild(n)}),s.appendChild(a)}),a.appendChild(s),t.appendChild(a),e.appendChild(t),d.appendChild(e)}if(l.column_stats&&l.column_stats.length>0){let e=document.createElement("div");e.className="mm-studio-section",e.innerHTML=`<div class="mm-studio-sec-title"><span>📋</span> Column Statistics</div>`,l.column_stats.forEach(t=>{var a;let n=document.createElement("div");n.className="mm-studio-col-card",n.innerHTML=`
          <div class="mm-studio-col-hdr">
            <span class="mm-studio-col-name">${t.name}</span>
            <span class="mm-studio-badge ${t.is_numeric?"badge-num":"badge-cat"}">${t.dtype}</span>
          </div>
          <div class="mm-studio-col-meta">
            <span>Missing: <b>${t.missing_count} (${t.missing_pct}%)</b></span>
            <span>Unique: <b>${t.unique_count}</b></span>
            ${t.is_numeric&&void 0!==t.mean?`<span>Mean: <b>${t.mean.toFixed(2)}</b></span>`:""}
            ${t.is_numeric&&void 0!==t.min?`<span>Min/Max: <b>${t.min.toFixed(1)} / ${null==(a=t.max)?void 0:a.toFixed(1)}</b></span>`:""}
          </div>
        `,e.appendChild(n)}),d.appendChild(e)}this._contentArea.appendChild(d)}_renderTargetTab(){if(!this._dataset||!this._dataset.supported){this._contentArea.innerHTML='<div class="mm-studio-empty">Analyze a dataset to use Target Intelligence.</div>';return}let e=document.createDocumentFragment(),t=document.createElement("div");t.className="mm-studio-section",t.innerHTML=`
      <div class="mm-studio-sec-title"><span>🎯</span> Target Variable Analyzer</div>
      <div class="mm-studio-sec-sub">Select the dependent variable you want your ML model to predict.</div>
    `;let a=document.createElement("div");a.className="mm-studio-select-row";let n=document.createElement("select");n.className="mm-studio-select",(this._dataset.column_names||[]).forEach(e=>{let t=document.createElement("option");t.value=e,t.textContent=e,e===this._targetCol&&(t.selected=!0),n.appendChild(t)});let i=document.createElement("button");i.type="button",i.className="mm-studio-btn mm-btn-primary",i.textContent="\uD83C\uDFAF Inspect Target",a.append(n,i),t.appendChild(a),e.appendChild(t);let r=document.createElement("div");r.className="mm-studio-target-result",e.appendChild(r);let s=async e=>{this._targetCol=e,r.innerHTML='<div class="mm-studio-loading">Analyzing target health...</div>';try{let t=await f("api/dataset/target",this._app.serviceManager.serverSettings,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({file_path:this._currentPath,target_column:e})});this._displayTargetResult(r,t)}catch(e){r.innerHTML=`<div class="mm-studio-alert mm-alert-error">${e instanceof Error?e.message:"Target analysis failed."}</div>`}};i.addEventListener("click",()=>s(n.value)),n.addEventListener("change",()=>s(n.value)),this._contentArea.appendChild(e),this._targetCol&&s(this._targetCol)}_displayTargetResult(e,t){var a,n,i,r,s,o,l,d,c,m,p;e.replaceChildren();let u=document.createElement("div");u.className="mm-studio-card";let f="classification"===t.task?"#4f46e5":"#059669";if(u.innerHTML=`
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <span style="font-weight:700; font-size:14px;">${t.target_column||t.target||this._targetCol||"Target"}</span>
        <span class="mm-studio-badge" style="background:${"classification"===t.task?"#eef2ff":"#ecfdf5"}; color:${f}; border:1px solid ${"classification"===t.task?"#c7d2fe":"#a7f3d0"}; font-size:11px; font-weight:700;">
          ${(t.task_type||t.task||"ML").toUpperCase()} TASK
        </span>
      </div>
      <div class="mm-studio-stats-grid">
        <div class="mm-stat-box"><div class="mm-stat-val">${t.unique_count}</div><div class="mm-stat-lbl">Unique Values</div></div>
        <div class="mm-stat-box"><div class="mm-stat-val" style="color:${(null!=(a=t.missing_count)?a:0)>0?"#dc2626":"#059669"}">${null!=(n=t.missing_count)?n:0}</div><div class="mm-stat-lbl">Missing</div></div>
        <div class="mm-stat-box"><div class="mm-stat-val">${t.dtype}</div><div class="mm-stat-lbl">Data Type</div></div>
        <div class="mm-stat-box"><div class="mm-stat-val">${t.is_imbalanced?"Imbalanced":"Healthy"}</div><div class="mm-stat-lbl">Target Health</div></div>
      </div>
    `,(null!=(i=t.missing_count)?i:0)>0){let e=document.createElement("div");e.className="mm-studio-alert mm-alert-error",e.style.marginTop="10px",e.innerHTML=`❌ <b>Critical:</b> Target variable has ${t.missing_count} missing values. Supervised models cannot train on missing targets. Drop these rows before fitting.`,u.appendChild(e)}if(e.appendChild(u),"classification"===t.task){let a=document.createElement("div");a.className="mm-studio-section",a.innerHTML='<div class="mm-studio-sec-title"><span>⚖️</span> Class Distribution & Imbalance</div>';let n=document.createElement("div");if(n.className="mm-studio-alert mm-alert-info",n.textContent=t.is_numeric?"This numeric classification target is already encoded. This inspection does not change your data.":"This is a categorical target. This inspection does not encode or change your data. When you run generated classification code from Model Advisor, LabelEncoder is applied for training, its mapping is shown, and predictions are converted back to the original labels. Encoding does not improve model accuracy; clean inconsistent labels before training.",a.appendChild(n),t.class_percentages){if(void 0!==t.imbalance_ratio){let e=document.createElement("div");e.className=`mm-studio-alert ${t.is_imbalanced?"mm-alert-warning":"mm-alert-info"}`,e.innerHTML=`Imbalance Ratio: <b>${t.imbalance_ratio.toFixed(2)} : 1</b> — ${t.is_imbalanced?"⚠️ Significant class imbalance detected.":"✓ Well balanced target."}`,a.appendChild(e)}Object.entries(t.class_percentages).forEach(([e,n])=>{var i,r;let s=null!=(r=null==(i=t.class_counts)?void 0:i[e])?r:"",o=document.createElement("div");o.className="mm-studio-bar-row",o.innerHTML=`
            <div class="mm-studio-bar-label">
              <span>Class <b>"${e}"</b></span>
              <span class="mm-studio-bar-val">${s} (${n}%)</span>
            </div>
            <div class="mm-studio-bar-track">
              <div class="mm-studio-bar-fill" style="width:${n}%; background:#818cf8;"></div>
            </div>
          `,a.appendChild(o)})}e.appendChild(a)}if("regression"===t.task){let a=document.createElement("div");a.className="mm-studio-section",a.innerHTML=`<div class="mm-studio-sec-title"><span>📈</span> Continuous Target Stats</div>`;let n=document.createElement("div");if(n.className="mm-studio-stats-grid",n.innerHTML=`
        <div class="mm-stat-box"><div class="mm-stat-val">${null!=(s=null==(r=t.mean)?void 0:r.toFixed(2))?s:"—"}</div><div class="mm-stat-lbl">Mean</div></div>
        <div class="mm-stat-box"><div class="mm-stat-val">${null!=(l=null==(o=t.median)?void 0:o.toFixed(2))?l:"—"}</div><div class="mm-stat-lbl">Median</div></div>
        <div class="mm-stat-box"><div class="mm-stat-val">${null!=(c=null==(d=t.std)?void 0:d.toFixed(2))?c:"—"}</div><div class="mm-stat-lbl">Std Dev</div></div>
        <div class="mm-stat-box"><div class="mm-stat-val">${null!=(p=null==(m=t.skewness)?void 0:m.toFixed(2))?p:"—"}</div><div class="mm-stat-lbl">Skewness</div></div>
      `,a.appendChild(n),t.skewness&&Math.abs(t.skewness)>1){let e=document.createElement("div");e.className="mm-studio-alert mm-alert-warning",e.innerHTML=`⚠️ <b>High Skewness (${t.skewness.toFixed(2)}):</b> Target is heavily skewed. Consider applying <code>np.log1p()</code> or Box-Cox transformation.`,a.appendChild(e)}if(t.outlier_count&&t.outlier_count>0){let e=document.createElement("div");e.className="mm-studio-alert mm-alert-warning",e.innerHTML=`⚠️ <b>Outliers (${t.outlier_count}):</b> Target contains ${t.outlier_count} potential outliers (1.5 \xd7 IQR rule).`,a.appendChild(e)}e.appendChild(a)}if(t.recommendations&&t.recommendations.length>0){let a=document.createElement("div");a.className="mm-studio-section",a.innerHTML=`<div class="mm-studio-sec-title"><span>💡</span> Target Engineering Advice</div>`;let n=document.createElement("ul");n.className="mm-studio-list",t.recommendations.forEach(e=>{let t=document.createElement("li");t.textContent=e,n.appendChild(t)}),a.appendChild(n),e.appendChild(a)}}_renderFeatureTab(){if(!this._dataset||!this._dataset.supported){this._contentArea.innerHTML='<div class="mm-studio-empty">Analyze a dataset to use Feature Deep-Dive.</div>';return}let e=document.createDocumentFragment(),t=document.createElement("div");t.className="mm-studio-section",t.innerHTML=`
      <div class="mm-studio-sec-title"><span>📊</span> Feature Deep-Dive & Distribution</div>
      <div class="mm-studio-sec-sub">Examine individual feature distribution, outliers, and correlations.</div>
    `;let a=document.createElement("div");a.className="mm-studio-select-row";let n=document.createElement("select");n.className="mm-studio-select",(this._dataset.column_names||[]).forEach(e=>{let t=document.createElement("option");t.value=e,t.textContent=e,e===this._featureCol&&(t.selected=!0),n.appendChild(t)});let i=document.createElement("button");i.type="button",i.className="mm-studio-btn mm-btn-primary",i.textContent="\uD83D\uDCCA Inspect Feature",a.append(n,i),t.appendChild(a),e.appendChild(t);let r=document.createElement("div");r.className="mm-studio-feat-result",e.appendChild(r);let s=async e=>{this._featureCol=e,r.innerHTML='<div class="mm-studio-loading">Analyzing feature distribution...</div>';try{let t=await f("api/dataset/feature",this._app.serviceManager.serverSettings,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({file_path:this._currentPath,feature_column:e})});this._displayFeatureResult(r,t)}catch(e){r.innerHTML=`<div class="mm-studio-alert mm-alert-error">${e instanceof Error?e.message:"Feature analysis failed."}</div>`}};i.addEventListener("click",()=>s(n.value)),n.addEventListener("change",()=>s(n.value)),this._contentArea.appendChild(e),this._featureCol&&s(this._featureCol)}_displayFeatureResult(e,t){var a,n,i,r,s,o,l,d,c,m,p;e.replaceChildren();let u=document.createElement("div");u.className="mm-studio-card",u.innerHTML=`
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <span style="font-weight:700; font-size:14px;">${null!=(n=null!=(a=t.feature_column)?a:t.feature)?n:"—"}</span>
        <span class="mm-studio-badge ${(null!=(i=t.type)?i:t.feature_type)==="numerical"?"badge-num":"badge-cat"}">${(null!=(s=null!=(r=t.type)?r:t.feature_type)?s:"unknown").toUpperCase()}</span>
      </div>
      <div class="mm-studio-stats-grid">
        <div class="mm-stat-box"><div class="mm-stat-val">${null!=(o=t.missing_count)?o:0} (${(null!=(l=t.missing_percentage)?l:0).toFixed(1)}%)</div><div class="mm-stat-lbl">Missing</div></div>
        <div class="mm-stat-box"><div class="mm-stat-val">${null!=(d=t.unique_count)?d:0}</div><div class="mm-stat-lbl">Unique</div></div>
        ${void 0!==t.mean?`<div class="mm-stat-box"><div class="mm-stat-val">${t.mean.toFixed(2)}</div><div class="mm-stat-lbl">Mean</div></div>`:""}
        ${void 0!==t.median?`<div class="mm-stat-box"><div class="mm-stat-val">${t.median.toFixed(2)}</div><div class="mm-stat-lbl">Median</div></div>`:""}
        ${(null!=(c=t.std)?c:t.standard_deviation)!==void 0?`<div class="mm-stat-box"><div class="mm-stat-val">${(null!=(m=t.std)?m:t.standard_deviation).toFixed(2)}</div><div class="mm-stat-lbl">Std Dev</div></div>`:""}
        ${void 0!==t.skewness?`<div class="mm-stat-box"><div class="mm-stat-val">${t.skewness.toFixed(2)}</div><div class="mm-stat-lbl">Skewness</div></div>`:""}
        ${void 0!==t.outlier_count?`<div class="mm-stat-box"><div class="mm-stat-val" style="color:${t.outlier_count>0?"#f87171":"inherit"}">${t.outlier_count}</div><div class="mm-stat-lbl">Outliers</div></div>`:""}
      </div>
    `,e.appendChild(u);let f=document.createElement("div");if(f.className="mm-studio-section",f.innerHTML=`<div class="mm-studio-sec-title"><span>📊</span> Distribution</div>`,t.histogram_counts&&t.histogram_edges&&t.histogram_counts.length>0){let e=t.histogram_counts,a=t.histogram_edges,n=Math.max(...e,1),i=document.createElement("div");i.className="mm-studio-hist-container",e.forEach((e,t)=>{var r,s;let o=Math.round(e/n*100),l=document.createElement("div");l.className="mm-hist-col";let d=(null!=(r=a[t])?r:0).toFixed(0),c=(null!=(s=a[t+1])?s:0).toFixed(0);l.title=`[${d} – ${c}]: ${e}`,l.innerHTML=`
          <div class="mm-hist-bar" style="height:${Math.max(o,4)}%;"></div>
          <div class="mm-hist-label">${d}</div>
        `,i.appendChild(l)}),f.appendChild(i)}else if(t.histogram&&t.histogram.length>0){let e=Math.max(...t.histogram.map(e=>e.count),1),a=document.createElement("div");a.className="mm-studio-hist-container",t.histogram.forEach(t=>{let n=Math.round(t.count/e*100),i=document.createElement("div");i.className="mm-hist-col",i.title=`[${t.bin_start.toFixed(1)} – ${t.bin_end.toFixed(1)}]: ${t.count}`,i.innerHTML=`
          <div class="mm-hist-bar" style="height:${Math.max(n,4)}%;"></div>
          <div class="mm-hist-label">${t.bin_start.toFixed(0)}</div>
        `,a.appendChild(i)}),f.appendChild(a)}else if(t.category_distribution&&t.category_distribution.length>0)t.category_distribution.slice(0,10).forEach(e=>{let t=Math.round(e.percentage),a=document.createElement("div");a.className="mm-studio-bar-row",a.innerHTML=`
          <div class="mm-studio-bar-label">
            <span>"${e.value}"</span>
            <span class="mm-studio-bar-val">${e.count} (${t}%)</span>
          </div>
          <div class="mm-studio-bar-track">
            <div class="mm-studio-bar-fill" style="width:${t}%; background:#38bdf8;"></div>
          </div>
        `,f.appendChild(a)});else if(t.value_counts){let e=Object.entries(t.value_counts).slice(0,8),a=t.total_rows||1;e.forEach(([e,t])=>{let n=Math.round(t/a*100),i=document.createElement("div");i.className="mm-studio-bar-row",i.innerHTML=`
          <div class="mm-studio-bar-label">
            <span>"${e}"</span>
            <span class="mm-studio-bar-val">${t} (${n}%)</span>
          </div>
          <div class="mm-studio-bar-track">
            <div class="mm-studio-bar-fill" style="width:${n}%; background:#38bdf8;"></div>
          </div>
        `,f.appendChild(i)})}if(e.appendChild(f),t.correlations&&Object.keys(t.correlations).length>0){let a=document.createElement("div");a.className="mm-studio-section",a.innerHTML=`<div class="mm-studio-sec-title"><span>🔗</span> Correlations with Other Features</div>`;let n=null!=(p=t.feature_column)?p:t.feature;Object.entries(t.correlations).forEach(([e,t])=>{if(e===n)return;let i=Math.abs(t),r=t>0?"#059669":"#dc2626",s=document.createElement("div");s.className="mm-studio-bar-row",s.innerHTML=`
          <div class="mm-studio-bar-label">
            <span>${e}</span>
            <span class="mm-studio-bar-val" style="color:${r}; font-weight:700;">r = ${t.toFixed(3)}</span>
          </div>
          <div class="mm-studio-bar-track">
            <div class="mm-studio-bar-fill" style="width:${Math.round(100*i)}%; background:${r};"></div>
          </div>
        `,a.appendChild(s)}),e.appendChild(a)}}_renderPreprocessingTab(){if(!this._dataset||!this._dataset.supported){this._contentArea.innerHTML='<div class="mm-studio-empty">Analyze a dataset to get Smart Preprocessing recommendations.</div>';return}this._contentArea.replaceChildren();let e=document.createDocumentFragment(),t=document.createElement("div");t.className="mm-studio-section";let a={basic:"\uD83D\uDFE2 Basic — Learn how simple mean, median, or mode filling works, and why the observed values support it.",medium:"\uD83D\uDFE1 Medium — Impute and inspect distribution / IQR flags; cap only after checking that flagged values are errors.",advanced:"\uD83D\uDD34 Advanced — Use leakage-safe sklearn Pipelines and ColumnTransformers fitted on training rows only."},n=document.createElement("div");n.className="mm-studio-level-row",n.id="mm-prep-level-row";let i=document.createElement("span");i.style.cssText="font-size:12px; opacity:.8; margin-right:8px; font-weight:700;",i.textContent="Skill Level:",n.appendChild(i);let r=document.createElement("div");r.className=`mm-prep-level-banner mm-prep-level-${this._prepLevel}`,r.textContent=a[this._prepLevel];let s=()=>{n.querySelectorAll(".mm-level-pill").forEach(e=>{let t=e.dataset.level===this._prepLevel;e.className=`mm-level-pill${t?" active":""}`}),r.className=`mm-prep-level-banner mm-prep-level-${this._prepLevel}`,r.textContent=a[this._prepLevel]};["basic","medium","advanced"].forEach(e=>{let t=document.createElement("button");t.type="button",t.dataset.level=e,t.className=`mm-level-pill ${this._prepLevel===e?"active":""}`,t.textContent=e.charAt(0).toUpperCase()+e.slice(1),t.addEventListener("click",()=>{this._prepLevel=e,s(),this._loadPreprocessingAdvice(o)}),n.appendChild(t)}),t.appendChild(n),t.appendChild(r),e.appendChild(t);let o=document.createElement("div");o.className="mm-studio-prep-cards",e.appendChild(o),this._contentArea.appendChild(e),this._loadPreprocessingAdvice(o)}async _loadPreprocessingAdvice(e){let t=++this._preprocessingRequestId,a=this._prepLevel,n=this._pathInput.value.trim()||this._currentPath;e.innerHTML='<div class="mm-studio-loading">Generating smart preprocessing recommendations...</div>';try{let i=await f("api/dataset/preprocessing",this._app.serviceManager.serverSettings,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({file_path:n,level:a})});if(t!==this._preprocessingRequestId||!e.isConnected)return;if(this._resolvedDatasetPath=i.resolved_path||n,e.replaceChildren(),i.dataset_warnings&&i.dataset_warnings.length>0){let t=document.createElement("div");t.className="mm-studio-alert mm-alert-warning",t.innerHTML=`<b>Dataset Observations:</b><br/>${i.dataset_warnings.map(e=>`• ${e}`).join("<br/>")}`,e.appendChild(t)}if(!i.recommendations||0===i.recommendations.length){e.innerHTML='<div class="mm-studio-empty">No preprocessing needed! Dataset is clean.</div>';return}if(i.recommendations.forEach(t=>{let a=this._createRecommendationCard(t,i.recommendations);e.appendChild(a)}),"advanced"===a&&i.pipeline_code){let t=[v(this._resolvedDatasetPath),"",i.pipeline_code].join("\n"),a=document.createElement("div");a.style.cssText=`
          margin-top:18px; padding:16px; border-radius:12px;
          background:#f0fdf4; border:1px solid #bbf7d0;
        `;let n=document.createElement("div");n.style.cssText="font-size:14px; font-weight:750; margin-bottom:6px; color:#15803d;",n.innerHTML="\uD83D\uDE80 Suggested Full ColumnTransformer Pipeline";let r=document.createElement("div");r.style.cssText="font-size:13px; line-height:1.55; color:#475569; margin-bottom:12px;",r.textContent="This pipeline combines all numerical and categorical columns with proper imputation, scaling, and encoding.";let s=document.createElement("pre");s.style.cssText=`
          background:#ffffff; border:1px solid #dfe3ea; border-radius:8px;
          padding:14px 16px; font-size:12px; overflow-x:auto; margin:0;
          font-family:ui-monospace,SFMono-Regular,monospace; line-height:1.65; color:#1e293b;
        `,s.textContent=t;let o=document.createElement("div");o.style.cssText="display:flex; gap:8px; margin-top:10px;";let l=document.createElement("button");l.type="button",l.className="mm-studio-btn mm-btn-sm",l.innerHTML="\uD83D\uDCCB Copy Pipeline",l.addEventListener("click",async()=>{await navigator.clipboard.writeText(t),l.textContent="Copied!",setTimeout(()=>{l.innerHTML="\uD83D\uDCCB Copy Pipeline"},1500)});let d=document.createElement("button");if(d.type="button",d.className="mm-studio-btn mm-btn-sm mm-btn-primary",d.innerHTML="\uD83D\uDCE5 Insert Pipeline",d.addEventListener("click",()=>{let e=this._insertPreprocessingCode(t);this._showToast(e?"✓ Pipeline code inserted!":"Open a notebook first.")}),this._canUseCodeAction("insert"))o.append(l,d);else{let e=document.createElement("button");e.type="button",e.className="mm-studio-btn mm-btn-sm",e.textContent="\uD83D\uDD0D Preview Code",e.addEventListener("click",()=>{this._showCodePreviewModal("Full preprocessing pipeline",t,"advanced")}),o.append(e)}a.append(n,r,s,o),e.appendChild(a)}}catch(a){if(t!==this._preprocessingRequestId||!e.isConnected)return;e.innerHTML=`<div class="mm-studio-alert mm-alert-error">${a instanceof Error?a.message:"Failed to generate recommendations."}</div>`}}_createRecommendationCard(e,t){var a;let n=document.createElement("div");n.className="mm-studio-card mm-prep-card";let i={none:"#059669",low:"#d97706",moderate:"#ea580c",high:"#dc2626",very_high:"#991b1b"}[e.missing_severity]||"#64748b",r=document.createElement("div");r.className="mm-prep-hdr",r.innerHTML=`
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-weight:700; font-size:13px;">${e.feature}</span>
        <span class="mm-studio-badge ${"numerical"===e.feature_type?"badge-num":"badge-cat"}">${e.feature_type.toUpperCase()}</span>
      </div>
      <span class="mm-studio-badge" style="background:${i}22; color:${i}; border:1px solid ${i}44;">
        ${e.numeric_conversion_required&&(e.parse_failure_count||0)>0?`${e.actual_missing_count||0} BLANK + ${e.parse_failure_count} UNPARSEABLE (${e.missing_pct}%)`:`${e.missing_count} MISSING (${e.missing_pct}%)`}
      </span>
    `;let s=document.createElement("div");if(s.className="mm-prep-action",s.innerHTML=`<b>Recommended:</b> ${e.recommended_action||e.imputation_strategy}`,"numerical"===e.feature_type){let t=document.createElement("div");t.className="mm-prep-profile";let i="discrete"===e.numeric_kind?"Discrete / count-like":"continuous"===e.numeric_kind?"Continuous-like":"Numeric type unknown",r=(e.distribution_shape||"unknown").replace(/_/g," "),s="number"==typeof e.skewness?e.skewness.toFixed(2):"unavailable",o="number"==typeof e.outlier_percentage?e.outlier_percentage:e.outlier_pct;if(t.textContent=`📊 Profile: ${i} \xb7 ${r} \xb7 skewness ${s} \xb7 IQR outliers ${null!=(a=e.outlier_count)?a:0} (${null!=o?o:0}%)`,e.transformation_strategy&&"none"!==e.transformation_strategy){let a=document.createElement("div");a.style.marginTop="4px";let n="log1p_candidate"===e.transformation_strategy?"Log1p candidate":"power_transform_candidate"===e.transformation_strategy?"Yeo-Johnson candidate":e.transformation_strategy.replace(/_/g," ");a.textContent=`Distribution option: ${n}. `+(e.transformation_reason||"Validate the transformed shape before using it."),t.appendChild(a)}n.appendChild(t)}let o=document.createElement("div");o.className="mm-prep-why";let l=document.createElement("b");if(l.textContent="✅ Why this choice: ",o.append(l,e.why||e.explanation),"numerical"===e.feature_type&&e.imputation_reason){let t=document.createElement("div");t.style.marginTop="4px",t.textContent=`Imputation rationale: ${e.imputation_reason}`,o.appendChild(t)}let d=[...Array.isArray(e.warnings)?e.warnings:[],...e.risks?[e.risks]:[]].filter((e,t,a)=>e&&!/^no risks?\b/i.test(e.trim())&&a.indexOf(e)===t),c=d.length>0?document.createElement("div"):null;if(c){c.className="mm-prep-risk-box";let e=document.createElement("strong");e.textContent="⚠️ Considerations";let t=document.createElement("ul");t.style.cssText="margin:6px 0 0;padding-left:20px;",d.forEach(e=>{let a=document.createElement("li");a.textContent=e,t.appendChild(a)}),c.append(e,t)}let m=document.createElement("div");m.className="mm-prep-strategy-row";let p=document.createElement("select");p.className="mm-studio-select mm-select-sm";let u="numerical"===e.feature_type?["mean","median","most_frequent","constant","standard_scaler","minmax_scaler","robust_scaler","cap_outliers_iqr","drop_column"]:["most_frequent","unknown","one_hot_encode","ordinal_encode","frequency_encode","drop_column"],h=u.includes(e.imputation_strategy)?e.imputation_strategy:"numerical"===e.feature_type?"median":u[0];u.forEach(e=>{let t=document.createElement("option");t.value=e,t.textContent=e.replace(/_/g," ").toUpperCase(),e===h&&(t.selected=!0),p.appendChild(t)});let g=!1;p.addEventListener("change",()=>{g=!0});let b=()=>this._buildFullPreprocessingCode(e,p.value,g?void 0:e.example_code);m.innerHTML='<span style="font-size:10px; opacity:.7;">Strategy:</span>',m.appendChild(p);let x=document.createElement("div");x.className="mm-prep-preview-box",x.style.display="none";let _=document.createElement("div");_.className="mm-prep-btn-row";let v=document.createElement("button");v.type="button",v.className="mm-studio-btn mm-btn-sm",v.innerHTML="\uD83D\uDC41️ Preview",v.title="Preview before and after",v.addEventListener("click",async()=>{v.disabled=!0,v.textContent="⏳ Loading...";try{let t=await f("api/dataset/preprocessing/preview",this._app.serviceManager.serverSettings,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({file_path:this._currentPath,feature:e.feature,strategy:p.value})});this._renderLivePreview(x,t,e,this._prepLevel),x.style.display="block"}catch(e){x.innerHTML=`<div class="mm-studio-alert mm-alert-error">${e instanceof Error?e.message:"Preview failed."}</div>`,x.style.display="block"}finally{v.disabled=!1,v.innerHTML="\uD83D\uDC41️ Preview"}});let y=document.createElement("button");y.type="button",y.className="mm-studio-btn mm-btn-sm mm-btn-accent",y.innerHTML="⚡ Apply to File",y.title="Apply transformation directly to dataset with backup",y.addEventListener("click",async()=>{if(confirm(`Apply '${p.value}' to column '${e.feature}' in ${this._currentPath}?
A .bak backup will be created.`)){y.disabled=!0,y.textContent="Applying...";try{let t=await f("api/dataset/preprocessing/apply",this._app.serviceManager.serverSettings,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({file_path:this._currentPath,feature:e.feature,strategy:p.value})});this._showToast(`✓ Applied ${p.value} to ${e.feature}! Backup created.`),t.dataset&&(this._dataset=t.dataset),this._loadDataset(this._currentPath)}catch(e){this._showToast(`❌ Apply failed: ${e instanceof Error?e.message:"Error"}`)}finally{y.disabled=!1,y.innerHTML="⚡ Apply to File"}}});let w=document.createElement("button");w.type="button",w.className="mm-studio-btn mm-btn-sm",w.innerHTML="↩️ Undo",w.title="Restore original dataset from backup",w.addEventListener("click",async()=>{if(confirm(`Undo changes and restore ${this._currentPath} from backup?`))try{let e=await f("api/dataset/preprocessing/undo",this._app.serviceManager.serverSettings,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({file_path:this._currentPath})});this._showToast("✓ Restored dataset from backup!"),e.dataset&&(this._dataset=e.dataset),this._loadDataset(this._currentPath)}catch(e){this._showToast(`❌ Undo failed: ${e instanceof Error?e.message:"Error"}`)}});let C=document.createElement("button");C.type="button",C.className="mm-studio-btn mm-btn-sm mm-btn-primary",C.innerHTML="\uD83D\uDCE5 Insert Code",C.title="Insert complete runnable preprocessing code, including loading the selected dataset",C.addEventListener("click",()=>{let e=b();this._insertPreprocessingCode(e)?this._showToast("✓ Full preprocessing code inserted below active cell!"):this._showToast("Please open a notebook first.")});let k=document.createElement("button");k.type="button",k.className="mm-studio-btn mm-btn-sm",k.innerHTML="\uD83D\uDCCB Copy",k.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(b()),k.textContent="Copied!",setTimeout(()=>{k.innerHTML="\uD83D\uDCCB Copy"},1500)}catch(e){k.textContent="Error"}});let E=document.createElement("button");E.type="button",E.className="mm-studio-btn mm-btn-sm",E.innerHTML="\uD83D\uDD0D Preview Code",E.title="View the generated code in a readable panel",E.addEventListener("click",()=>{this._showCodePreviewModal(e.feature,b(),this._prepLevel)}),_.append(v,y,w),this._canUseCodeAction("insert")&&_.append(C,k),_.append(E),n.append(r,s);let $=n.querySelector(".mm-prep-profile");return $&&n.appendChild($),n.appendChild(o),c&&n.appendChild(c),n.append(m,x,_),n}_buildFullPreprocessingCode(e,t,a){return function(e,t,a,n){var i;let r,s;if(null==n?void 0:n.trim())return["# Recommended preprocessing workflow for the selected skill level",v(e),"",n.trim()].join("\n");let o=new Set(["import pandas as pd"]),l=a;"most_frequent_or_unknown"===l&&(l="most_frequent");let d=JSON.stringify(t.feature),c=`df[${d}]`;switch(l){case"mean":case"median":r=`${c} = pd.to_numeric(${c}, errors="coerce")
${c} = ${c}.fillna(${c}.${l}())`;break;case"most_frequent":r=`mode = ${c}.mode(dropna=True)
fill_value = mode.iloc[0] if not mode.empty else "Unknown"
${c} = ${c}.fillna(fill_value)`;break;case"unknown":r=`${c} = ${c}.fillna("Unknown")`;break;case"constant":r=[..."numerical"===t.feature_type?[`${c} = pd.to_numeric(${c}, errors="coerce")`]:[],`${c} = ${c}.fillna(${"numerical"===t.feature_type?"0":'"Unknown"'})`].join("\n");break;case"drop_column":r=`df = df.drop(columns=[${d}])`;break;case"standard_scaler":case"minmax_scaler":case"robust_scaler":{let e={standard_scaler:"StandardScaler",minmax_scaler:"MinMaxScaler",robust_scaler:"RobustScaler"}[l];o.add(`from sklearn.preprocessing import ${e}`),r=`${c} = pd.to_numeric(${c}, errors="coerce")
${c} = ${c}.fillna(${c}.median())
df[[${d}]] = ${e}().fit_transform(df[[${d}]])`;break}case"cap_outliers_iqr":r=`${c} = pd.to_numeric(${c}, errors="coerce")
q1 = ${c}.quantile(0.25)
q3 = ${c}.quantile(0.75)
iqr = q3 - q1
${c} = ${c}.clip(lower=q1 - 1.5 * iqr, upper=q3 + 1.5 * iqr)`;break;case"one_hot_encode":r=`${c} = ${c}.fillna("Unknown")
df = pd.get_dummies(df, columns=[${d}], prefix=[${d}], dtype=int)`;break;case"ordinal_encode":r=`${c} = ${c}.fillna("Unknown").astype("category").cat.codes`;break;case"frequency_encode":r=`${c} = ${c}.fillna("Unknown")
frequencies = ${c}.value_counts(normalize=True)
${c} = ${c}.map(frequencies)`;break;default:r=`# No transformation is needed for ${d}.`}return t.numeric_conversion_required&&"numerical"===t.feature_type&&"drop_column"!==l&&(o.add("import re"),r=[`# Parse recognized numeric text in ${d}; malformed cells become NaN for review.`,`_raw_numeric_text = ${c}.astype('string').str.extract(`,'    r"^\\s*[$₹€\xa3\xa5]?\\s*([+-]?(?:(?:\\d{1,3}(?:,\\d{3})+)|\\d+)(?:\\.\\d+)?(?:[eE][+-]?\\d+)?)\\s*(?:kg|kgs|kilograms?|grams?|g|cm|centimeters?|m|meters?|mm|lbs?|pounds?|inches?|in|ft|years?|yrs?|months?|days?|hours?|hrs?|%)?\\s*$",\n    flags=re.IGNORECASE, expand=False\n)',`${c} = pd.to_numeric(_raw_numeric_text.str.replace(',', '', regex=False), errors='coerce')`,"",r].join("\n")),["# Complete preprocessing workflow for the analyzed dataset",...Array.from(o),"",`df = pd.${"xlsx"===(s=null==(i=e.split(/[?#]/,1)[0].split(".").pop())?void 0:i.toLowerCase())||"xls"===s?"read_excel":"json"===s?"read_json":"read_csv"}(${JSON.stringify(e)})`,'print(f"Loaded dataset: {df.shape[0]} rows \xd7 {df.shape[1]} columns")',"","# Apply preprocessing only to the selected column",r,"","# Check the result",'print(f"Dataset shape after preprocessing: {df.shape}")',`print("Missing values remaining in " + ${d} + ": " + str(${c}.isna().sum()) if ${d} in df.columns else "Selected column was dropped.")`,"","# Preview only the selected column or its encoded output columns",..."one_hot_encode"===l?[`print(df.loc[:, [column for column in df.columns if column == ${d} or column.startswith(${JSON.stringify(`${t.feature}_`)})]].head())`]:"drop_column"===l?['print("Selected column was dropped as requested.")']:[`print(df[[${d}]].head())`]].join("\n")}(this._resolvedDatasetPath||this._pathInput.value.trim()||this._currentPath,e,t,a)}_showCodePreviewModal(e,t,a){var n;null==(n=document.getElementById("mm-code-preview-modal"))||n.remove();let i={basic:"#059669",medium:"#d97706",advanced:"#4f46e5"}[a]||"#4f46e5",r=document.createElement("div");r.id="mm-code-preview-modal",r.style.cssText=`
      position:fixed; inset:0; z-index:99999;
      background:rgba(0,0,0,0.75); backdrop-filter:blur(4px);
      display:flex; align-items:center; justify-content:center;
      padding:20px;
    `;let s=document.createElement("div");s.style.cssText=`
      background:#ffffff; border:1px solid #dfe3ea; border-radius:12px;
      padding:0; width:min(680px, 95vw); max-height:85vh;
      display:flex; flex-direction:column; box-shadow:0 20px 45px rgba(0,0,0,0.12);
      overflow:hidden; color:#253041;
    `;let o=document.createElement("div");o.style.cssText=`
      display:flex; align-items:center; gap:10px; padding:16px 20px;
      border-bottom:1px solid #dfe3ea;
      background:#f8fafc;
    `,o.innerHTML=`
      <span style="font-size:16px;">🔍</span>
      <div style="flex:1;">
        <div style="font-size:13px; font-weight:700; color:#172554;">Code Preview — <code style="color:${i};">${e}</code></div>
        <div style="font-size:10px; color:#64748b; margin-top:2px;">
          Skill Level: <span style="color:${i}; font-weight:600; text-transform:capitalize;">${a}</span>
        </div>
      </div>
    `;let l=document.createElement("button");l.type="button",l.innerHTML="✕",l.style.cssText=`
      background:#f1f5f9; border:1px solid #dfe3ea;
      color:#475569; border-radius:8px; width:28px; height:28px;
      cursor:pointer; font-size:12px; display:flex; align-items:center; justify-content:center;
    `,l.addEventListener("click",()=>r.remove()),o.appendChild(l);let d=document.createElement("div");d.style.cssText="flex:1; overflow-y:auto; padding:16px 20px; background:#f8fafc;";let c=document.createElement("div");c.style.cssText="display:flex; align-items:center; gap:8px; margin-bottom:12px;",c.innerHTML=`
      <span style="
        font-size:9.5px; font-weight:700; padding:3px 9px; border-radius:99px;
        background:${i}15; color:${i}; border:1px solid ${i}35;
        text-transform:uppercase; letter-spacing:0.5px;
      ">${a} level</span>
      <span style="font-size:10.5px; color:#64748b;">Python code for column: ${e}</span>
    `;let m=document.createElement("pre");m.style.cssText=`
      background:#ffffff; border:1px solid #dfe3ea; border-radius:8px;
      padding:16px 18px; font-size:11.5px; line-height:1.7;
      font-family:ui-monospace,SFMono-Regular,'Cascadia Code',monospace;
      color:#1e293b; overflow-x:auto; margin:0; white-space:pre;
    `,m.textContent=t,d.append(c,m);let p=document.createElement("div");p.style.cssText=`
      display:flex; gap:8px; padding:14px 20px;
      border-top:1px solid #dfe3ea;
      background:#ffffff;
    `;let u=document.createElement("button");u.type="button",u.className="mm-studio-btn mm-btn-sm",u.innerHTML="\uD83D\uDCCB Copy Code",u.addEventListener("click",async()=>{await navigator.clipboard.writeText(t),u.textContent="Copied!",setTimeout(()=>{u.innerHTML="\uD83D\uDCCB Copy Code"},1500)});let f=document.createElement("button");f.type="button",f.className="mm-studio-btn mm-btn-sm mm-btn-primary",f.innerHTML="\uD83D\uDCE5 Insert into Notebook",f.addEventListener("click",()=>{let e=this._insertCodeBelow(t);this._showToast(e?"✓ Code inserted into notebook!":"Please open a notebook first."),r.remove()});let h=document.createElement("button");h.type="button",h.className="mm-studio-btn mm-btn-sm",h.innerHTML="Close",h.addEventListener("click",()=>r.remove()),this._canUseCodeAction("copy")&&p.append(u,f),p.append(h),s.append(o,d,p),r.appendChild(s),r.addEventListener("click",e=>{e.target===r&&r.remove()}),document.body.appendChild(r)}_renderLivePreview(e,t,a,n){var i,r,s,o,l,d,c;e.replaceChildren();let m=document.createElement("div");m.style.cssText="font-weight:750; font-size:14px; margin-bottom:12px; color:#166534;",m.textContent=`👁️ Live Preview: ${t.strategy.replace(/_/g," ")} on ${t.feature}`;let p=t.before.statistics,u=t.after.statistics,f=null!=(r=null!=(i=null==p?void 0:p.missing_count)?i:t.before.missing_count)?r:0,h=null!=(o=null!=(s=null==u?void 0:u.missing_count)?s:t.after.missing_count)?o:0,g=null!=(l=null==p?void 0:p.mean)?l:t.before.mean,b=null!=(d=null==u?void 0:u.mean)?d:t.after.mean,x=t.before.sample||t.before.sample_values||[],_=t.after.sample||t.after.sample_values||[],v=document.createElement("div");if(v.className="mm-studio-stats-grid",v.innerHTML=`
      <div class="mm-stat-box">
        <div class="mm-stat-val" style="color:#dc2626;">${f}</div>
        <div class="mm-stat-lbl">Missing Before</div>
      </div>
      <div class="mm-stat-box">
        <div class="mm-stat-val" style="color:#059669;">${h}</div>
        <div class="mm-stat-lbl">Missing After</div>
      </div>
      ${void 0!==g?`
        <div class="mm-stat-box">
          <div class="mm-stat-val">${"number"==typeof g?g.toFixed(2):g}</div>
          <div class="mm-stat-lbl">Mean Before</div>
        </div>
      `:""}
      ${void 0!==b?`
        <div class="mm-stat-box">
          <div class="mm-stat-val">${"number"==typeof b?b.toFixed(2):b}</div>
          <div class="mm-stat-lbl">Mean After</div>
        </div>
      `:""}
      ${(null==p?void 0:p.skewness)!==void 0?`
        <div class="mm-stat-box">
          <div class="mm-stat-val">${null===p.skewness?"—":p.skewness.toFixed(2)}</div>
          <div class="mm-stat-lbl">Skewness Before</div>
        </div>
      `:""}
      ${(null==u?void 0:u.skewness)!==void 0?`
        <div class="mm-stat-box">
          <div class="mm-stat-val">${null===u.skewness?"—":u.skewness.toFixed(2)}</div>
          <div class="mm-stat-lbl">Skewness After</div>
        </div>
      `:""}
    `,(null==p?void 0:p.category_distribution)&&(null==u?void 0:u.category_distribution)){let i=p.category_distribution,r=u.category_distribution,s=i.categories,o=document.createElement("div");o.style.cssText="font-size:13px;font-weight:750;margin:14px 0 7px;color:#173b2b;",o.textContent="Categorical histogram — frequency before vs after";let l=Math.max(130,38+32*s.length),d=document.createElementNS("http://www.w3.org/2000/svg","svg");d.setAttribute("viewBox",`0 0 360 ${l}`),d.setAttribute("role","img"),d.setAttribute("aria-label",`Categorical histogram for ${t.feature} before and after ${t.strategy} imputation`),d.style.cssText="width:100%;height:auto;max-height:260px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;";let c=(e,t,a)=>{let n=document.createElementNS("http://www.w3.org/2000/svg",e);return Object.entries(t).forEach(([e,t])=>n.setAttribute(e,t)),a&&(n.textContent=a),d.appendChild(n),n};c("rect",{x:"126",y:"9",width:"9",height:"9",rx:"2",fill:"#6366f1"}),c("text",{x:"140",y:"17",fill:"#475569","font-size":"10"},`Before (n=${i.sample_count})`),c("rect",{x:"244",y:"9",width:"9",height:"9",rx:"2",fill:"#10b981"}),c("text",{x:"258",y:"17",fill:"#475569","font-size":"10"},`After (n=${r.sample_count})`);let f=Math.max(1,...i.percentages,...r.percentages);s.forEach((e,t)=>{let a=27+32*t;c("text",{x:"8",y:String(a+15),fill:"#334155","font-size":"10"},e.length>17?`${e.slice(0,16)}…`:e),c("rect",{x:String(128),y:String(a+1),width:String(164),height:"8",rx:"3",fill:"#eef2ff"}),c("rect",{x:String(128),y:String(a+12),width:String(164),height:"8",rx:"3",fill:"#ecfdf5"});let n=i.percentages[t]/f*164,s=r.percentages[t]/f*164;c("rect",{x:String(128),y:String(a+1),width:n.toFixed(2),height:"8",rx:"3",fill:"#6366f1"}).appendChild(document.createElementNS("http://www.w3.org/2000/svg","title")).textContent=`Before \xb7 ${i.counts[t]} rows (${i.percentages[t]}%)`,c("rect",{x:String(128),y:String(a+12),width:s.toFixed(2),height:"8",rx:"3",fill:"#10b981"}).appendChild(document.createElementNS("http://www.w3.org/2000/svg","title")).textContent=`After \xb7 ${r.counts[t]} rows (${r.percentages[t]}%)`,c("text",{x:String(297),y:String(a+8),fill:"#64748b","font-size":"9"},`${i.percentages[t].toFixed(1)}%`),c("text",{x:String(297),y:String(a+19),fill:"#64748b","font-size":"9"},`${r.percentages[t].toFixed(1)}%`)});let h=document.createElement("div");h.className="mm-prep-preview-note",h.textContent=s.includes("Other (remaining)")?"Bars compare category percentages on a shared scale. The eight most common categories are shown; the remaining categories are grouped as Other.":"Bars compare category percentages on a shared scale. Percentages use each side’s non-missing row count.";let g=document.createElement("div");g.className="mm-prep-preview-rationale";let b=document.createElement("strong");b.textContent=`✅ Why this ${n} choice? `;let x=document.createElement("span");if(x.textContent=a.why||a.explanation,g.append(b,x),a.imputation_reason){let e=document.createElement("div");e.style.cssText="margin-top:7px;",e.textContent=`Method rationale: ${a.imputation_reason}`,g.appendChild(e)}let _=document.createElement("div");_.className="mm-prep-preview-note",_.textContent=t.details||t.explanation||"",e.append(m,v,o,d,h,g,_)}else if((null==p?void 0:p.pdf)&&(null==u?void 0:u.pdf)){let i=document.createElement("div");i.style.cssText="font-size:13px;font-weight:750;margin:14px 0 7px;color:#173b2b;",i.textContent="PDF — empirical probability density (shared bins)";let r=document.createElementNS("http://www.w3.org/2000/svg","svg");r.setAttribute("viewBox","0 0 360 176"),r.setAttribute("role","img"),r.setAttribute("aria-label",`Probability density plot for ${t.feature} before and after ${t.strategy} imputation`),r.style.cssText="width:100%;height:auto;max-height:190px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;";let s=p.pdf.edges,o=p.pdf.density,l=u.pdf.density,d=Math.min(o.length,l.length,Math.max(0,s.length-1)),f=Math.max(0,...o.slice(0,d),...l.slice(0,d)),h=(e,t,a)=>{let n=document.createElementNS("http://www.w3.org/2000/svg",e);return Object.entries(t).forEach(([e,t])=>n.setAttribute(e,t)),a&&(n.textContent=a),r.appendChild(n),n};if(h("line",{x1:String(42),y1:String(136),x2:String(352),y2:String(136),stroke:"#94a3b8","stroke-width":"1"}),h("line",{x1:String(42),y1:String(24),x2:String(42),y2:String(136),stroke:"#94a3b8","stroke-width":"1"}),f>0&&d>0){let e=310/d,t=Math.max(2,.39*e);for(let a=0;a<d;a+=1){let n=42+a*e+.08*e,i=o[a]/f*112,r=l[a]/f*112;h("rect",{x:n.toFixed(2),y:(136-i).toFixed(2),width:t.toFixed(2),height:Math.max(.5,i).toFixed(2),rx:"1",fill:"#6366f1",opacity:"0.78"}).appendChild(document.createElementNS("http://www.w3.org/2000/svg","title")).textContent=`Before \xb7 ${p.pdf.counts[a]} rows \xb7 density ${o[a]}`,h("rect",{x:(n+t+.06*e).toFixed(2),y:(136-r).toFixed(2),width:t.toFixed(2),height:Math.max(.5,r).toFixed(2),rx:"1",fill:"#10b981",opacity:"0.78"}).appendChild(document.createElementNS("http://www.w3.org/2000/svg","title")).textContent=`After \xb7 ${u.pdf.counts[a]} rows \xb7 density ${l[a]}`}}h("rect",{x:"48",y:"7",width:"9",height:"9",rx:"2",fill:"#6366f1"}),h("text",{x:"61",y:"15",fill:"#475569","font-size":"9"},`Before (n=${p.pdf.sample_count})`),h("rect",{x:"166",y:"7",width:"9",height:"9",rx:"2",fill:"#10b981"}),h("text",{x:"179",y:"15",fill:"#475569","font-size":"9"},`After (n=${u.pdf.sample_count})`),h("text",{x:String(42),y:"169",fill:"#64748b","font-size":"9"},String(s[0])),h("text",{x:String(352),y:"169",fill:"#64748b","font-size":"9","text-anchor":"end"},String(s[s.length-1]));let g=document.createElement("div");g.className="mm-prep-preview-note",g.textContent="This empirical PDF is a density-normalized histogram: bar area represents probability, and total area is approximately 1.";let b=null,x=null,_=null;if("discrete"===a.numeric_kind)(_=document.createElement("div")).className="mm-prep-preview-note",_.textContent="KDE is omitted because this is a discrete/count-like feature; smoothing it would imply values between valid counts. The PDF above shows its empirical distribution.";else if(p.kde&&u.kde){(b=document.createElement("div")).style.cssText="font-size:13px;font-weight:750;margin:14px 0 7px;color:#173b2b;",b.textContent="KDE — smoothed density estimate (before vs after)",(x=document.createElementNS("http://www.w3.org/2000/svg","svg")).setAttribute("viewBox","0 0 360 176"),x.setAttribute("role","img"),x.setAttribute("aria-label",`Gaussian KDE plot for ${t.feature} before and after ${t.strategy} imputation`),x.style.cssText="width:100%;height:auto;max-height:190px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;";let e=p.kde.x,a=p.kde.density,n=u.kde.density,i=Math.min(e.length,a.length,n.length),r=Math.max(0,...a.slice(0,i),...n.slice(0,i)),s=(e,t,a)=>{let n=document.createElementNS("http://www.w3.org/2000/svg",e);return Object.entries(t).forEach(([e,t])=>n.setAttribute(e,t)),a&&(n.textContent=a),null==x||x.appendChild(n),n};if(s("line",{x1:String(42),y1:String(136),x2:String(352),y2:String(136),stroke:"#94a3b8","stroke-width":"1"}),s("line",{x1:String(42),y1:String(24),x2:String(42),y2:String(136),stroke:"#94a3b8","stroke-width":"1"}),r>0&&i>1){let e=e=>e.slice(0,i).map((e,t)=>{let a=42+t/(i-1)*310;return`${0===t?"M":"L"}${a.toFixed(2)},${(136-e/r*112).toFixed(2)}`}).join(" ");s("path",{d:e(a),fill:"none",stroke:"#6366f1","stroke-width":"2.5","stroke-linejoin":"round","stroke-linecap":"round"}),s("path",{d:e(n),fill:"none",stroke:"#10b981","stroke-width":"2.5","stroke-linejoin":"round","stroke-linecap":"round"})}s("line",{x1:"48",y1:"12",x2:"58",y2:"12",stroke:"#6366f1","stroke-width":"3"}),s("text",{x:"62",y:"15",fill:"#475569","font-size":"9"},`Before (n=${p.kde.sample_count})`),s("line",{x1:"166",y1:"12",x2:"176",y2:"12",stroke:"#10b981","stroke-width":"3"}),s("text",{x:"180",y:"15",fill:"#475569","font-size":"9"},`After (n=${u.kde.sample_count})`),s("text",{x:String(42),y:"169",fill:"#64748b","font-size":"9"},String(e[0])),s("text",{x:String(352),y:"169",fill:"#64748b","font-size":"9","text-anchor":"end"},String(e[i-1])),(_=document.createElement("div")).className="mm-prep-preview-note",_.textContent=`Gaussian KDE with shared bandwidth ${null!=(c=p.kde.bandwidth)?c:"—"}; this is a smoothed estimate, while the PDF above shows binned empirical density.`}let y=document.createElement("div");y.className="mm-prep-preview-rationale";let w=document.createElement("strong");w.textContent=`✅ Why this ${n} choice? `;let C=document.createElement("span");if(C.textContent=a.why||a.explanation,y.append(w,C),a.imputation_reason){let e=document.createElement("div");e.style.cssText="margin-top:7px;",e.textContent=`Method rationale: ${a.imputation_reason}`,y.appendChild(e)}let k=document.createElement("div");k.className="mm-prep-preview-note",k.textContent=t.details||t.explanation||"",e.append(m,v,i,r,g),b&&x&&_?e.append(b,x,_):_&&e.append(_),e.append(y,k)}let y=document.createElement("div");y.className="mm-prep-sample-box";let w=document.createElement("div");w.style.cssText="font-size:10px;font-weight:600;margin-bottom:4px;opacity:.8;",w.textContent="Sample values (before vs after):";let C=document.createElement("div");C.style.cssText="display:flex;gap:10px;font-family:monospace;font-size:10px;";let k=document.createElement("div");k.style.flex="1";let E=document.createElement("div");E.style.cssText="opacity:.6;margin-bottom:2px;",E.textContent="Before:";let $=document.createElement("div");$.style.color="#dc2626",$.textContent=x.slice(0,5).map(e=>null===e?"NaN":"number"==typeof e?e.toFixed(1):String(e)).join(", "),k.append(E,$);let T=document.createElement("div");T.style.flex="1";let S=document.createElement("div");S.style.cssText="opacity:.6;margin-bottom:2px;",S.textContent="After:";let N=document.createElement("div");if(N.style.color="#059669",N.textContent=_.slice(0,5).map(e=>null===e?"NaN":"number"==typeof e?e.toFixed(1):String(e)).join(", "),T.append(S,N),C.append(k,T),y.append(w,C),(null==p?void 0:p.pdf)&&(null==u?void 0:u.pdf))e.appendChild(y);else{let t=document.createElement("div");t.className="mm-prep-text",t.textContent=a.why||a.explanation,e.append(m,v,t,y)}}_renderModelAdvisorTab(){var e;if(!this._dataset||!this._dataset.supported){this._contentArea.innerHTML='<div class="mm-studio-empty">Analyze a dataset first to get model recommendations.</div>';return}this._contentArea.replaceChildren();let t=document.createDocumentFragment(),a=document.createElement("div");a.className="mm-studio-section",a.innerHTML=`
      <div class="mm-studio-sec-title"><span>🤖</span> Intelligent Model Advisor</div>
      <div class="mm-studio-sec-sub">
        Choose the target you want to predict. ModelMind screens model candidates,
        then compares the finalists with cross-validation. Each model's Why section
        shows the measured evidence, how it fits the data, and what the score cannot prove.
      </div>
    `;let n=document.createElement("div");n.style.cssText="display:flex; align-items:center; gap:10px; margin-top:10px;";let i=document.createElement("span");i.style.cssText="font-size:11px; opacity:.7; font-weight:600;",i.textContent="\uD83C\uDFAF Target Column:";let r=document.createElement("select");r.className="mm-studio-select mm-select-sm",r.style.maxWidth="200px",(null!=(e=this._dataset.column_names)?e:[]).forEach(e=>{let t=document.createElement("option");t.value=e,t.textContent=e,(e===this._targetCol||e===this._dataset.column_names[this._dataset.column_names.length-1])&&(t.selected=!0),r.appendChild(t)});let s=document.createElement("button");s.type="button",s.className="mm-studio-btn mm-btn-sm mm-btn-accent",s.innerHTML="\uD83D\uDE80 Get Recommendations",n.append(i,r,s),r.addEventListener("change",()=>{this._targetCol=r.value}),a.appendChild(n),t.appendChild(a);let o=document.createElement("div");o.style.cssText="background:#fff;border:1px solid #c7d2fe;border-radius:12px;padding:14px;margin-bottom:16px;";let l=document.createElement("div");l.style.cssText="font-size:14px;font-weight:800;color:#1e293b;margin-bottom:5px;",l.textContent="Measured Model Performance";let d=document.createElement("div");d.style.cssText="font-size:11px;color:#64748b;line-height:1.6;margin-bottom:10px;",d.textContent="Run real 3-fold cross-validation on your selected dataset. The score is measured on validation folds; the top-ranked model is not a guarantee for new data, and screened-out models are not fully compared.";let c=document.createElement("div");c.style.cssText="display:flex;gap:8px;flex-wrap:wrap;align-items:center;";let m=document.createElement("button");m.type="button",m.className="mm-studio-btn mm-btn-sm mm-btn-accent",m.textContent="Evaluate Models on My Dataset";let p=document.createElement("button");p.type="button",p.className="mm-studio-btn mm-btn-sm",p.textContent="Cancel Evaluation",p.disabled=!0;let u=document.createElement("div");u.style.cssText="font-size:11px;color:#475569;margin-top:10px;",u.textContent="Evaluation has not started.";let h=document.createElement("div");h.style.cssText="margin-top:12px;",c.append(m,p),o.append(l,d,c,u,h),t.appendChild(o);let g=null,b=!1,x=this._app.serviceManager.serverSettings,_=e=>{b=e,m.disabled=e,p.disabled=!e||!g},v=(e,t,a,n)=>{var i,r,s,o,l,d,c;h.replaceChildren();let m=null==e?void 0:e.empirical_evaluation;if(!m||!0!==m.success){u.textContent="Evaluation did not return a successful comparison.";return}let p=String(null!=(i=m.metric)?i:"score"),f=!0===m.higher_is_better,g=document.createElement("div");g.style.cssText="font-size:12px;font-weight:700;margin-bottom:8px;",g.textContent=`Best measured model: ${String(null!=(r=m.recommended_model)?r:"Unknown")} | ${p}: ${String(null!=(s=m.recommended_score)?s:"N/A")}`;let b=document.createElement("div");b.style.cssText="font-size:10px;color:#64748b;margin-bottom:10px;",b.textContent=`${String(null!=(o=m.cv_folds)?o:3)}-fold cross-validation. `+(f?"Higher scores are better.":"Lower scores are better.")+" Results depend on this dataset and are not guarantees.";let x=document.createElement("table");x.style.cssText="width:100%;border-collapse:collapse;font-size:11px;";let _=document.createElement("tr");for(let e of["Model","Status","Mean score","Std. dev.","Scaler"]){let t=document.createElement("th");t.textContent=e,t.style.cssText="padding:8px;border-bottom:1px solid #e2e8f0;text-align:left;background:#f8fafc;",_.appendChild(t)}for(let e of(x.appendChild(_),Array.isArray(m.ranking)?m.ranking:[])){let t=document.createElement("tr"),a="number"==typeof e.mean_score?e.mean_score.toFixed(4):"N/A",n="number"==typeof e.std_score?e.std_score.toFixed(4):"N/A";for(let i of[null!=(l=e.model)?l:"Unknown",null!=(d=e.status)?d:"Unknown",a,n,null!=(c=e.scaler)?c:"None"]){let e=document.createElement("td");e.textContent=String(i),e.style.cssText="padding:8px;border-bottom:1px solid #e2e8f0;",t.appendChild(e)}x.appendChild(t)}if(h.append(g,b,x),Array.isArray(m.warnings)&&m.warnings.length>0){let e=document.createElement("div");e.style.cssText="font-size:10px;color:#92400e;margin-top:10px;",e.textContent=m.warnings.filter(e=>"string"==typeof e).join(" "),h.appendChild(e)}let v=null==e?void 0:e.automl_recommendations;(null==v?void 0:v.success)===!0&&Array.isArray(v.recommendations)&&!0===m.success&&this._renderFastTuneTopFive(h,t,a,n,v,m)};p.addEventListener("click",async()=>{if(g){p.disabled=!0;try{await f(`api/dataset/evaluation-jobs/${g}/cancel`,x,{method:"POST"}),u.textContent="Cancellation requested. Waiting for worker to stop..."}catch(e){u.textContent=`Cancellation request failed: ${String(e)}`,p.disabled=!1}}}),m.addEventListener("click",async()=>{var e,t;if(b||s.disabled)return;let a=r.value,n=this._currentPath;if(!n||!a){u.textContent="Select a dataset and target column first.";return}let i=()=>o.isConnected&&"model-advisor"===this._activeTab&&this._currentPath===n&&r.value===a;h.replaceChildren(),g=null,_(!0),s.disabled=!0,u.textContent="Submitting measured model evaluation...";let l=null,d=async()=>{if(l)try{await f(`api/dataset/evaluation-jobs/${l}/cancel`,x,{method:"POST"})}catch(e){}};try{let r=await f("api/dataset/evaluation-jobs",x,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({file_path:n,target_col:a,cv_folds:3,evaluate_scalers:!1})});if("string"!=typeof r.job_id||!r.job_id)throw Error("Evaluation job ID was not returned.");if(l=r.job_id,g=r.job_id,!i())return void await d();p.disabled=!1;let s=!1;for(let o=0;o<180;o++){if(!i())return void await d();let o=await f(`api/dataset/evaluation-jobs/${r.job_id}`,x);if(!i())return void await d();let l=String(null!=(e=o.status)?e:"unknown");if(u.textContent=`Dataset target: ${a} | Job: ${l}`,"completed"===l){s=!0,v(o.result,r.job_id,n,a);break}if(["failed","cancelled","timed_out"].includes(l)){s=!0,u.textContent=`Evaluation ${l}: ${String(null!=(t=o.error)?t:"")}`;break}await new Promise(e=>{setTimeout(e,1e3)})}!s&&i()&&(u.textContent="Still waiting. The evaluation may continue on the server.")}catch(e){i()&&(u.textContent=`Evaluation error: ${String(e)}`)}finally{g=null,_(!1),s.disabled=!1}});let k=document.createElement("div");t.appendChild(k),this._contentArea.appendChild(t);let E=!1,$=async()=>{var e,t;if(E)return;let a=r.value,n=this._currentPath,i=()=>k.isConnected&&"model-advisor"===this._activeTab&&this._currentPath===n&&r.value===a;if(!a||!n){k.textContent="Select a dataset and target column first.";return}if(b){k.textContent="An evaluation is already running in this panel. Wait for it to finish before requesting recommendations.";return}E=!0,s.disabled=!0,k.replaceChildren();let o=document.createElement("div");o.className="mm-studio-loading",o.textContent="Starting measured AutoML evaluation...";let l=document.createElement("button");l.type="button",l.className="mm-studio-btn mm-btn-sm",l.textContent="Cancel AutoML",l.disabled=!0,k.append(o,l);let d=null,c=!1;l.addEventListener("click",async()=>{if(d&&!c){c=!0,l.disabled=!0,o.textContent="Requesting cancellation...";try{await f(`api/dataset/evaluation-jobs/${d}/cancel`,this._app.serviceManager.serverSettings,{method:"POST"})}catch(e){c=!1,l.disabled=!1,o.textContent=`Cancellation request failed: ${String(e)}`}}});try{let r=this._app.serviceManager.serverSettings,s=await f("api/dataset/evaluation-jobs",r,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({file_path:n,target_col:a,cv_folds:3,evaluate_scalers:!1})});if("string"!=typeof s.job_id)throw Error("Evaluation job ID is missing.");if(d=s.job_id,l.disabled=!1,!i()){try{await f(`api/dataset/evaluation-jobs/${d}/cancel`,r,{method:"POST"})}catch(e){}return}let c=!1;for(let s=0;s<180;s++){if(!i()){try{await f(`api/dataset/evaluation-jobs/${d}/cancel`,r,{method:"POST"})}catch(e){}return}let s=await f(`api/dataset/evaluation-jobs/${d}`,r);if(!i()){try{await f(`api/dataset/evaluation-jobs/${d}/cancel`,r,{method:"POST"})}catch(e){}return}let m=String(null!=(e=s.status)?e:"unknown");if(o.textContent=`AutoML: ${m} — comparing regression or classification algorithms using cross-validation.`,"completed"===m){c=!0;let e=s.result,t=null==e?void 0:e.automl_recommendations;if(!(null==e?void 0:e.handled)||!(null==t?void 0:t.success)||!Array.isArray(t.recommendations)||0===t.recommendations.length)throw Error("Completed evaluation has no valid AutoML recommendations.");let i=t.recommendations.map((a,n)=>{var i,r,s,o;let l=Number.isInteger(a.rank)?a.rank:n+1,d=1===l?t.recommendations.find(e=>2===e.rank):t.recommendations.find(e=>1===e.rank),c=function(e){var t,a,n,i,r,s,o,l,d,c,m,p,u;let f=e.name.trim().toLowerCase(),h=y[f],g=null!=(t=w[f])?t:"Its measured validation result, rather than its name, determines its rank.",b=C(e.name,e),x=[],_="number"==typeof e.score&&Number.isFinite(e.score)?"classification"===e.task?`${(100*e.score).toFixed(2)}% ${e.metric.toLowerCase()}`:`${e.metric} ${e.score.toFixed(4)}`:"";if(_&&x.push(`${_} mean across ${e.cvFolds?`${e.cvFolds}-fold`:""}${"classification"===e.task?" stratified":""} cross-validation${e.cvFolds?` (${e.cvFolds} train/test rotations)`:""}; `+("classification"===e.task?"class proportions are kept similar in each split, and higher balanced accuracy is better.":"lower RMSE is better; RMSE measures prediction error in the target’s units and penalizes larger errors more.")),"classification"===e.task&&Array.isArray(e.classDistribution)&&e.classDistribution.length>0){let t=e.classDistribution.filter(e=>Number.isFinite(e.count)&&Number.isFinite(e.share)).map(e=>`${e.label}: ${e.count.toLocaleString()} (${(100*e.share).toFixed(1)}%)`).join("; ");if(t&&(x.push(`Target ${e.targetColumn?`“${e.targetColumn}” `:""}class balance: ${t}. Balanced accuracy checks each class equally, so performance on the larger class cannot hide weak results on the smaller class.`),"number"==typeof e.score&&Number.isFinite(e.score))){let t=1/e.classDistribution.length,a=(e.score-t)*100;x.push(`A constant predictor has a ${e.classDistribution.length}-class balanced-accuracy reference of ${(100*t).toFixed(2)}%; a predictor that always guesses one class gets this reference. This result is ${Math.abs(a).toFixed(2)} percentage points ${a>=0?"above":"below"} it.`)}}if("number"==typeof e.rowsEvaluated&&"number"==typeof e.rowsAvailable&&x.push(e.rowsEvaluated<e.rowsAvailable?`The final comparison used a reproducible ${e.rowsEvaluated.toLocaleString()}-row sample from ${e.rowsAvailable.toLocaleString()} rows with target values; it did not evaluate every row.`:`Final cross-validation used all ${e.rowsAvailable.toLocaleString()} rows with a target value.`),"number"==typeof e.rowsTotal&&"number"==typeof e.rowsExcludedMissingTarget&&e.rowsExcludedMissingTarget>0&&x.push(`${e.rowsExcludedMissingTarget.toLocaleString()} of ${e.rowsTotal.toLocaleString()} rows were excluded because the selected target was missing.`),"number"==typeof e.candidateCount&&"number"==typeof e.finalistCount&&e.candidateCount>e.finalistCount){let t="number"==typeof e.screeningRows?` on ${e.screeningRows.toLocaleString()} rows`:"";x.push(`A first-pass screen compared ${e.candidateCount} candidates${e.screeningFolds?` with ${e.screeningFolds}-fold CV`:""}${t}; ${e.finalistCount} finalists then received the full comparison. Models left out by the first pass were not fully evaluated, so they are not proven worse.`)}for(let t of("number"==typeof e.numericFeatureCount&&"number"==typeof e.categoricalFeatureCount&&x.push(`The inputs contain ${e.numericFeatureCount} numeric and ${e.categoricalFeatureCount} category-based features. When values are missing, numeric gaps are filled with the median and categories with the most common value; categories are then one-hot encoded. These preprocessing steps are learned only from the training part of each CV split${e.scaler&&"none"!==e.scaler?`; this model also used ${e.scaler} scaling`:""}.`),"number"==typeof e.featureMissingCount&&x.push(0===e.featureMissingCount?"The selected input features have no missing values, so the fill steps did not change any cells.":`${e.featureMissingCount.toLocaleString()} missing input values were filled using values learned from each training split.`),null!=(a=e.warnings)?a:[]))t.toLowerCase().includes("optional python package")&&x.push(t);let v="";if("number"==typeof e.score&&Number.isFinite(e.score)&&"number"==typeof e.comparisonScore&&Number.isFinite(e.comparisonScore)&&e.comparisonName){let t=Math.abs(e.score-e.comparisonScore),a="classification"===e.task?`${(100*t).toFixed(2)} percentage points`:`${t.toFixed(4)} RMSE units`,i=1===e.rank?"ahead of":"behind";v=`It is ${a} ${i} ${e.comparisonName}`;let r=["number"==typeof e.scoreStd&&Number.isFinite(e.scoreStd)?{name:"this model",value:e.scoreStd}:null,"number"==typeof e.comparisonStd&&Number.isFinite(e.comparisonStd)?{name:null!=(n=e.comparisonName)?n:"comparison model",value:e.comparisonStd}:null].filter(e=>null!==e);if(r.length>0){let a=r.map(t=>{let a="classification"===e.task?`${(100*t.value).toFixed(2)} percentage points`:t.value.toFixed(4);return`${t.name}: ${a}`}).join("; "),n=r.every(e=>t<=e.value)?2===r.length?", both larger than this gap":", larger than this gap":"";v+=`; the score varied across folds (standard deviations: ${a}${n}). This describes fold-to-fold variation; it is not a confidence interval or significance test.`}else v+=".";x.push(v)}let k="number"==typeof e.score&&Number.isFinite(e.score)?`Result: #${e.rank}/${e.finalistCount} \xb7 ${e.metric} ${u=e.score,"classification"===e.task&&/accuracy|precision|recall|f1|auc/i.test(e.metric)?`${(100*u).toFixed(2)}%`:u.toFixed(4)}${e.cvFolds?` \xb7 ${e.cvFolds}-fold CV`:" \xb7 cross-validation"}.`:`Result: #${e.rank}/${e.finalistCount} finalists \xb7 cross-validation.`,E=[],$=null!=(i=e.rowsEvaluated)?i:e.rowsAvailable;"number"==typeof $&&Number.isFinite($)&&E.push(`${$.toLocaleString()} rows`),"number"==typeof e.numericFeatureCount&&"number"==typeof e.categoricalFeatureCount&&E.push(`${e.numericFeatureCount} numeric, ${e.categoricalFeatureCount} categorical features`),"number"==typeof e.featureMissingCount&&E.push(0===e.featureMissingCount?"no missing inputs":`${e.featureMissingCount.toLocaleString()} missing inputs handled`);let T=[];if("number"==typeof e.scoreStd&&Number.isFinite(e.scoreStd)){let t="classification"===e.task&&/accuracy|precision|recall|f1|auc/i.test(e.metric);T.push(`fold SD ${t?`${(100*e.scoreStd).toFixed(2)} pp`:e.scoreStd.toFixed(4)}`)}if("number"==typeof e.score&&Number.isFinite(e.score)&&"number"==typeof e.comparisonScore&&Number.isFinite(e.comparisonScore)&&e.comparisonName){let t=Math.abs(e.score-e.comparisonScore),a="classification"===e.task&&/accuracy|precision|recall|f1|auc/i.test(e.metric)?`${(100*t).toFixed(2)} pp`:`${t.toFixed(4)} RMSE`,n=Math.max(null!=(r=e.scoreStd)?r:0,null!=(s=e.comparisonStd)?s:0),i=n>0&&t<=n,o=1===e.rank?"ahead of":"behind";T.push(`${a} ${o} ${e.comparisonName}${i?" (within fold variation)":""}`)}let S=1===e.rank?"Decision: Top-scoring tested finalist; confirm on a separate holdout.":"Decision: #1 scored higher; use this as a comparison alternative.";return{why:[k,`Model fit: ${g}`,...E.length>0?[`Data: ${E.join(" \xb7 ")}.`]:[],...T.length>0?[`Comparison: ${T.join(" \xb7 ")}.`]:["Comparison: Cross-validation estimates can vary across splits."],S].join("\n"),reasons:b,evidence:x,confidence:"Treat this as a shortlist based on the tested finalists, not a guarantee of future performance. The top model was chosen using these same scores, so its score may be optimistic; check it on a separate holdout set before relying on it. If rows repeat people or sites, or represent time periods, use splits that keep those groups or dates separate.",strengths:null!=(o=null==h?void 0:h.strengths)?o:["Evaluated with the selected dataset and metric","Preprocessing was fitted within CV folds"],weaknesses:null!=(l=null==h?void 0:h.weaknesses)?l:["Performance may change on new data","The final holdout score can differ from cross-validation"],bestFor:null!=(d=null==h?void 0:h.bestFor)?d:"Compare this model when its inductive bias fits the data and evaluation goal.",trainingSpeed:null!=(c=null==h?void 0:h.trainingSpeed)?c:"Dataset dependent",complexity:null!=(m=null==h?void 0:h.complexity)?m:"Model dependent",interpretability:null!=(p=null==h?void 0:h.interpretability)?p:"Model dependent"}}({name:String(a.name),task:t.task,metric:String(null!=(r=null!=(i=a.metric)?i:t.metric)?r:"CV score"),score:a.measured_score,scoreStd:a.std_score,comparisonName:null==d?void 0:d.name,comparisonScore:null==d?void 0:d.measured_score,comparisonStd:null==d?void 0:d.std_score,rank:l,finalistCount:t.recommendations.length,candidateCount:t.candidate_count,cvFolds:null!=(s=a.cv_folds)?s:t.cv_folds,screeningFolds:t.screening_folds,screeningRows:t.screening_rows,rowsAvailable:t.rows_available,rowsTotal:t.rows_total,rowsEvaluated:t.rows_evaluated,rowsExcludedMissingTarget:t.rows_excluded_missing_target,targetColumn:null!=(o=t.target_column)?o:e.target_column,classDistribution:t.class_distribution,numericFeatureCount:t.numeric_feature_count,categoricalFeatureCount:t.categorical_feature_count,featureMissingCount:t.feature_missing_count,scaler:a.scaler,warnings:t.warnings});return{name:a.name,rank:l,medal:1===l?"\uD83E\uDD47":2===l?"\uD83E\uDD48":3===l?"\uD83E\uDD49":"\uD83C\uDFC5",score:0,tags:["Measured CV","regression"===t.task?"Regression":"Classification"],why:c.why,reasons:c.reasons,why_evidence:c.evidence,why_confidence:c.confidence,strengths:c.strengths,weaknesses:c.weaknesses,best_for:c.bestFor,training_speed:c.trainingSpeed,complexity:c.complexity,interpretability:c.interpretability,code:a.code_available?a.code:"",defaultCode:a.code_available?a.code:"",automl_measured:!0,measured_score:a.measured_score,measured_std:a.std_score,automl_task:t.task,code_available:a.code_available,code_error:a.code_error}}),r={...e,models:i,automl_measured:!0,automl_candidate_count:t.candidate_count,automl_task:t.task};k.replaceChildren(),this._renderModelAdvisorResults(k,r),this._renderFastTuneTopFive(k,d,n,a,t,e.empirical_evaluation,i);break}if(["failed","cancelled","timed_out"].includes(m)){c=!0,o.textContent=`AutoML ${m}: ${String(null!=(t=s.error)?t:"")}`,l.disabled=!0;break}await new Promise(e=>setTimeout(e,1e3))}c||(o.textContent="Evaluation is still pending on the server.",l.disabled=!0)}catch(e){o.textContent=`AutoML failed: ${String(e)}`,l.disabled=!0}finally{E=!1,s.disabled=!1}};s.addEventListener("click",$),$()}_renderModelAdvisorResults(e,t){var a,n,i,r,s,o,l;if(!t.handled){e.innerHTML=`<div class="mm-studio-alert mm-alert-error">${null!=(a=t.error)?a:"Analysis failed."}</div>`;return}let d=document.createDocumentFragment(),c=document.createElement("div");c.style.cssText="display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:16px;";let m=(e,t,a="#4f46e5")=>{let n=document.createElement("div");n.style.cssText=`
        padding:12px; border-radius:10px; border:1px solid #dfe3ea;
        background:#ffffff; box-shadow:0 1px 3px rgba(31,41,55,0.03);
      `,n.innerHTML=`
        <div style="font-size:16px; font-weight:800; color:${a};">${t}</div>
        <div style="font-size:9.5px; color:#5d6b80; text-transform:uppercase; letter-spacing:0.3px; font-weight:600; margin-top:2px;">${e}</div>
      `,c.appendChild(n)};m("Rows",null!=(i=null==(n=t.rows)?void 0:n.toLocaleString())?i:"—"),m("Features",`${t.n_numeric_features} num \xb7 ${t.n_categorical_features} cat`),m("Missing Data",t.has_missing?`${t.missing_pct}%`:"None",t.has_missing?"#dc2626":"#059669"),d.appendChild(c);let p=document.createElement("div");if(p.style.cssText=`
      padding:10px 14px; border-radius:10px; margin-bottom:16px; font-size:12px; font-weight:600;
      background:${"regression"===t.task?"#eef2ff":"#ecfdf5"};
      border:1px solid ${"regression"===t.task?"#c7d2fe":"#a7f3d0"};
      color:${"regression"===t.task?"#4338ca":"#065f46"};
    `,p.innerHTML=`
      <b>Detected Task:</b> ${t.task_label}
      &nbsp;\xb7&nbsp; <b>Target Column:</b> <code>${t.target_column}</code>
      &nbsp;\xb7&nbsp; <b>Dataset Size:</b> ${t.dataset_size_label}
    `,d.appendChild(p),"LabelEncoder"===t.target_encoding){let e=document.createElement("div");e.className="mm-studio-alert mm-alert-info",e.style.marginBottom="16px",e.textContent="LabelEncoder is included in the generated classification code: target categories are encoded for training, the code prints the label-to-number mapping, and predictions are converted back to the original category names. The source CSV is not changed.",d.appendChild(e)}let u=document.createElement("div");u.style.cssText="font-size:13px; font-weight:700; margin-bottom:12px; color:#1e293b;",u.innerHTML=`🏆 Ranked Model Recommendations <span style="color:#64748b; font-weight:400; font-size:11px;">(${null!=(s=null==(r=t.models)?void 0:r.length)?s:0} models analysed)</span>`,t.automl_measured&&(u.textContent=`Measured AutoML Rankings (${t.models.length} finalists from ${null!=(o=t.automl_candidate_count)?o:"multiple"} candidates)`),d.appendChild(u),(null!=(l=t.models)?l:[]).forEach(e=>{d.appendChild(this._buildModelCard(e,t.target_column))}),e.appendChild(d)}_renderFastTuneTopFive(e,t,a,n,i,r,s=[]){let o=null==i?void 0:i.recommendations,l=null==r?void 0:r.features,d=null==r?void 0:r.task;if(!Array.isArray(o)||o.length<1||o.length>5||!Array.isArray(l)||0===l.length||!["classification","regression"].includes(d))return;let c=o.map(e=>e.name);if(!c.every(e=>"string"==typeof e&&e.length>0))return;let m=document.createElement("section");m.className="mm-studio-section",m.style.cssText="margin-top:18px;padding:16px;border:1px solid #c7d2fe;border-radius:12px;background:#f8faff;";let p=document.createElement("div");p.style.cssText="font-size:15px;font-weight:800;color:#1e293b;",p.textContent="Fast Hyperparameter Tuning";let u=document.createElement("p");u.style.cssText="font-size:12px;line-height:1.6;color:#475569;margin:8px 0 12px;",u.textContent="Search important parameters for your measured Top 5. Basic tests fewer configurations. Advanced explores more important settings. Only useful changes are shown.";let h=document.createElement("div");h.style.cssText="display:flex;gap:8px;align-items:center;margin-bottom:10px;";let g=document.createElement("label");g.textContent="Tuning level:",g.style.cssText="font-size:12px;font-weight:700;color:#334155;";let b=document.createElement("select");b.className="mm-studio-select",["basic","advanced"].forEach(e=>{let t=document.createElement("option");t.value=e,t.textContent="basic"===e?"Basic":"Advanced",b.appendChild(t)}),h.append(g,b);let x=document.createElement("div");x.style.cssText="font-size:11px;color:#64748b;margin-bottom:10px;";let v=()=>{x.textContent="advanced"===b.value?"Advanced: up to 20 configurations per model. More exploration; time limit may stop the search.":"Basic: up to 8 configurations per model. Focuses on high-impact hyperparameters."};b.addEventListener("change",v),v();let y=document.createElement("div");y.style.cssText="display:flex;gap:8px;flex-wrap:wrap;";let w=document.createElement("button");w.type="button",w.className="mm-studio-btn mm-btn-sm mm-btn-primary",w.textContent="⚡ Fast Tune Top 5";let C=document.createElement("button");C.type="button",C.className="mm-studio-btn mm-btn-sm",C.textContent="Cancel Tuning",C.disabled=!0,C.style.display="none";let E=document.createElement("div");E.setAttribute("role","status"),E.style.cssText="font-size:12px;color:#475569;margin-top:10px;",E.textContent="Tuning has not started.";let $=document.createElement("div");$.style.cssText="margin-top:12px;",y.append(w,C),m.append(p,u,h,x,y,E,$),e.appendChild(m);let T=null,S=!1,N=()=>m.isConnected&&"model-advisor"===this._activeTab&&this._currentPath===a&&this._targetCol===n,M=this._app.serviceManager.serverSettings,A=e=>{var t,a;$.replaceChildren();let n=document.createElement("div");n.style.cssText="font-size:13px;font-weight:800;margin-bottom:8px;",n.textContent="Tuned Models — Tested Results",$.appendChild(n);let i=document.createElement("p");i.style.cssText="font-size:11px;color:#64748b;line-height:1.5;",i.textContent=`Uses the Model Advisor metric (${String(null!=(t=null==e?void 0:e.metric)?t:"CV score")}), ${String(null!=(a=null==e?void 0:e.cv_folds)?a:"matching")} CV folds and its evaluated dataset sample, so default scores are directly comparable to the original finalists. Parameter selection can still overfit CV; confirm a final model on a separate test set before deployment.`,$.appendChild(i);let r=Array.isArray(null==e?void 0:e.results)?e.results:[],s=Array.isArray(null==e?void 0:e.ranking)?e.ranking:r,o=new Set(s.map(e=>null==e?void 0:e.model)),l=[...s,...r.filter(e=>!o.has(null==e?void 0:e.model))];if(!l.length){let t=document.createElement("pre");t.style.cssText="font-size:11px;white-space:pre-wrap;overflow-wrap:anywhere;",t.textContent=JSON.stringify(e,null,2),$.appendChild(t);return}let c=t=>{var a,n,i,r,s;let o=null!=(i=null!=(n=null!=(a=null==t?void 0:t.best_score)?a:null==t?void 0:t.mean_score)?n:null==t?void 0:t.score)?i:null==(r=null==t?void 0:t.best)?void 0:r.score;if("number"!=typeof o||!Number.isFinite(o))return"No valid CV score";if("regression"===d)return`RMSE: ${Math.abs(o).toFixed(4)} (lower is better)`;let l=String(null!=(s=null==e?void 0:e.metric)?s:"Accuracy");return/accuracy|f1|precision|recall|roc.?auc/i.test(l)?`${l}: ${(100*o).toFixed(2)}%`:`${l}: ${o.toFixed(4)}`},m=e=>null===e?"None":"string"==typeof e?e:JSON.stringify(e);l.forEach((t,a)=>{var n,i,r,s,o;let l=document.createElement("div");l.style.cssText="padding:12px;margin:8px 0;border:1px solid #e2e8f0;border-radius:10px;background:#fff;";let p=document.createElement("div");p.style.cssText="font-size:13px;font-weight:700;color:#0f172a;";let u=String(null!=(i=null!=(n=null==t?void 0:t.model)?n:null==t?void 0:t.name)?i:"Model");p.textContent=`${a+1}. ${u}`;let f=document.createElement("div");f.style.cssText="font-size:12px;font-weight:600;color:#059669;margin-top:6px;",f.textContent=c(t);let h=document.createElement("div");h.style.cssText="font-size:11px;color:#475569;margin-top:7px;line-height:1.6;";let g=Array.isArray(null==t?void 0:t.recommended_changes)?t.recommended_changes:[],b=(null==t?void 0:t.best_params)&&"object"==typeof t.best_params&&!Array.isArray(t.best_params)?t.best_params:{};if(g.length>0||Object.keys(b).length>0){let e=document.createElement("div");e.style.fontWeight="700",e.textContent=(null==t?void 0:t.completed)===!1?"Promising changes found (search incomplete):":"Recommended parameter changes:",h.appendChild(e),g.length>0?g.forEach(e=>{var t;let a=document.createElement("div");a.textContent=`${String(e.parameter)}: ${m(e.default)} → ${m(e.recommended)}`,h.appendChild(a);let n=document.createElement("div");n.style.cssText="font-size:10px;color:#64748b;margin:0 0 4px 8px;",n.textContent=null!=(t=k[String(e.parameter)])?t:"This setting controls model fit or complexity; its displayed value was selected by the measured cross-validation comparison.",h.appendChild(n)}):Object.entries(b).forEach(([e,t])=>{let a=document.createElement("div");a.textContent=`${e}: ${m(t)}`,h.appendChild(a)})}else{let e=String(null!=(r=null==t?void 0:t.recommendation_status)?r:"");"partial_defaults_recommended"===e?h.textContent="Defaults are the best-supported choice so far. The baseline settings are kept; the search is incomplete, so untested configurations could differ.":"insufficient_validation"===e?h.textContent="No parameter changes recommended: the evaluation had fewer than three CV folds, which is not enough to assess tuning improvements reliably.":"partial_parameter_changes"===e?h.textContent="Promising changes found, but the search is incomplete.":"defaults_recommended"===e?h.textContent="Default parameters are the best-supported choice: no tested alternative beat the baseline by a meaningful, consistent margin on the same CV folds.":"baseline_unavailable"===e?h.textContent="The default baseline was unavailable. No parameter changes can be recommended reliably.":"no_valid_configuration"===e||(null==t?void 0:t.status)==="failed"?h.textContent="No valid configuration was evaluated.":h.textContent="No parameter changes recommended."}let x=null==t?void 0:t.baseline_score,_=null==t?void 0:t.best_tested_score;if("number"==typeof x&&Number.isFinite(x)&&"number"==typeof _&&Number.isFinite(_)){let a=document.createElement("div");a.style.cssText="font-size:10px;color:#64748b;margin-top:6px;";let n=null==t?void 0:t.best_score,i="number"==typeof n&&Number.isFinite(n)?` • Recommended CV: ${c(t)}`:"";a.textContent=`Default CV: ${c({best_score:x})} • Best tested CV: ${c({best_score:_})}`+i,h.appendChild(a);let r=null==t?void 0:t.improvement_over_default;if("number"==typeof r&&Number.isFinite(r)){let t=document.createElement("div");t.style.cssText="font-size:10px;color:#475569;margin-top:4px;",t.textContent="classification"===d?`Best tested change vs. default: ${(100*r).toFixed(2)} percentage points in ${String(null!=(s=null==e?void 0:e.metric)?s:"CV score")}.`:`Best tested RMSE change vs. default: ${r.toFixed(4)} lower is better.`,h.appendChild(t)}}let v=null==t?void 0:t.configurations_tested,y=null==t?void 0:t.configurations_planned;if("number"==typeof v&&"number"==typeof y&&y>0){let e=document.createElement("div");e.style.cssText="font-size:11px;color:#475569;margin-top:7px;",e.textContent=`Configurations tested: ${v}/${y}`,h.appendChild(e)}if((null==t?void 0:t.completed)===!1){let e=document.createElement("div");e.style.cssText="font-size:11px;color:#b45309;margin-top:6px;",e.textContent="Partial search: not all configurations were tested.",h.appendChild(e)}let w=document.createElement("div");w.style.cssText="font-size:10.5px;color:#334155;margin-top:7px;line-height:1.5;";let C=String(null!=(o=null==t?void 0:t.recommendation_status)?o:"");if("parameter_changes_recommended"===C||"partial_parameter_changes"===C?w.textContent="Why these settings: this tested configuration was better than the default on the same CV folds and cleared the practical-gain and fold-consistency checks."+((null==t?void 0:t.completed)===!1?" The search is incomplete, so treat this as provisional.":""):"defaults_recommended"===C||"partial_defaults_recommended"===C?w.textContent="Why keep defaults: the baseline is the best-supported configuration. No tested alternative showed a sufficiently large, consistent improvement across the same CV folds."+((null==t?void 0:t.completed)===!1?" The search is incomplete; untested settings may differ.":""):"insufficient_validation"===C?w.textContent="Why no tuning change: too few CV folds were available to distinguish a real gain from fold-to-fold variation.":"baseline_unavailable"===C&&(w.textContent="Why no tuning change: without a valid default baseline, a fair parameter comparison is not possible."),w.textContent&&h.appendChild(w),"string"==typeof(null==t?void 0:t.code)&&t.code.trim()){let e=t.code,a=Object.keys(b).length>0,n=document.createElement("div");n.style.cssText="font-size:10.5px;color:#047857;margin-top:6px;font-weight:600;display:flex;align-items:center;gap:4px;",n.textContent=a?"CV-selected parameter values are applied in this code. The Model Advisor card keeps its baseline code separately.":"Defaults are the best-supported choice. This inserts the same default estimator settings as the baseline code; no parameter change passed the CV checks.",h.appendChild(n);let i=document.createElement("div");i.style.cssText="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;";let r=document.createElement("button");r.type="button",r.className="mm-studio-btn mm-btn-sm mm-btn-primary",r.style.cssText="background:#059669;border-color:#047857;color:#fff;font-weight:600;",r.textContent=a?"\uD83D\uDCE5 Insert CV-Selected Code":"\uD83D\uDCE5 Insert Default Code",r.addEventListener("click",()=>{let t=this._insertCodeBelow(e);this._showToast(t?`✓ CV-selected ${u} code inserted into notebook!`:"Open a notebook first.")});let s=document.createElement("button");s.type="button",s.className="mm-studio-btn mm-btn-sm",s.innerHTML="\uD83D\uDCCB Copy Code",s.addEventListener("click",async()=>{await navigator.clipboard.writeText(e),s.textContent="Copied!",setTimeout(()=>{s.innerHTML="\uD83D\uDCCB Copy Code"},1500)});let o=document.createElement("button");o.type="button",o.className="mm-studio-btn mm-btn-sm",o.innerHTML="\uD83D\uDD0D Preview Code",o.addEventListener("click",()=>{this._showCodePreviewModal(u+" (Tuned)",e,"advanced")}),this._canUseCodeAction("insert")?i.append(r,s,o):i.append(o),l.appendChild(i)}else if("string"==typeof(null==t?void 0:t.code_error)){let e=document.createElement("div");e.style.cssText="font-size:10px;color:#b45309;margin-top:6px;",e.textContent=`Could not synchronize generated code: ${t.code_error}`,h.appendChild(e)}let E=document.createElement("details");E.style.cssText="margin-top:9px;font-size:11px;color:#475569;";let T=document.createElement("summary");T.textContent="Advanced Details",T.style.cssText="cursor:pointer;font-weight:600;color:#4338ca;";let S=document.createElement("pre");S.style.cssText="margin:8px 0 0;padding:9px;background:#f8fafc;border-radius:8px;white-space:pre-wrap;overflow-wrap:anywhere;font-size:10px;";let N={...t};delete N.code,S.textContent=JSON.stringify(N,null,2),E.append(T,S),l.append(p,f,h,E),$.appendChild(l)})};C.addEventListener("click",async()=>{if(T){C.disabled=!0,E.textContent="Cancellation requested...";try{await f(`api/dataset/tuning-jobs/${T}/cancel`,M,{method:"POST"})}catch(e){E.textContent=`Cancellation request failed: ${String(e)}`,C.disabled=!1}}}),w.addEventListener("click",async()=>{var e,i,r,o,m,p;if(S||!N())return;S=!0,T=null,w.disabled=!0,C.disabled=!0,C.style.display="none",$.replaceChildren(),b.disabled=!0;let u=b.value;E.textContent=`Submitting ${u} tuning for Top 5...`;try{let h=await f("api/dataset/tuning-jobs",M,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({evaluation_job_id:t,file_path:a,target_column:n,feature_columns:l,task:d,model_names:c,time_budget_seconds:"advanced"===u?120:60,level:u})});if("string"!=typeof(null==h?void 0:h.job_id))throw Error("Tuning job ID is missing.");T=h.job_id,C.disabled=!1,C.style.display="inline-flex";let g=!1;for(let t=0;t<240;t++){if(!N()){E.textContent="Panel changed. Tuning continues on the server unless it is cancelled or reaches its timeout.";break}let t=await f(`api/dataset/tuning-jobs/${T}`,M),a=String(null!=(e=null==t?void 0:t.status)?e:"unknown");if(E.textContent=`Fast tuning: ${a}`,"completed"===a){g=!0,s.forEach(e=>{var t;e.code=e.defaultCode,delete e.tuned_code,e.code_available=!!e.defaultCode,e.tuned_configuration_applied=!1,delete e.tuned_params,delete e.tuned_changes,delete e.tuned_score,delete e.tuned_recommendation_status,delete e.tuned_code_error,null==(t=e.refreshCode)||t.call(e)}),A(t.result);let e=function(e,t){if(!Array.isArray(t))return{updated:0,errors:[]};let a=0,n=[];return t.forEach(t=>{var i,r,s;if(!t||"object"!=typeof t||"string"!=typeof t.model)return;let o=t.model.trim(),l=_(o),d=e.find(e=>{if(e.name===o)return!0;let t=_(e.name);return!!(t===l||(l.includes("svr")||l.includes("supportvectorreg"))&&(t.includes("svr")||t.includes("supportvectorreg"))||(l.includes("svm")||l.includes("supportvector"))&&(t.includes("svm")||t.includes("supportvector")))});if(d)if("string"==typeof t.code&&t.code.trim()){d.tuned_code=t.code,d.code_available=!0,d.tuned_configuration_applied=!0,d.tuned_params=t.best_params&&"object"==typeof t.best_params&&!Array.isArray(t.best_params)?t.best_params:void 0,d.tuned_changes=Array.isArray(t.recommended_changes)?t.recommended_changes:void 0;let e=null!=(r=null!=(i=t.best_score)?i:t.mean_score)?r:t.score;d.tuned_score="number"==typeof e?e:void 0,d.tuned_recommendation_status="string"==typeof t.recommendation_status?t.recommendation_status:void 0,delete d.tuned_code_error,null==(s=d.refreshCode)||s.call(d),a+=1}else"string"==typeof t.code_error&&(d.tuned_code_error=t.code_error,n.push(`${d.name}: ${t.code_error}`))}),{updated:a,errors:n}}(s,null==(i=t.result)?void 0:i.results);E.textContent=`Tuning finished: ${String(null!=(o=null==(r=t.result)?void 0:r.models_completed)?o:0)}/${c.length} models fully searched.`+((null==(m=t.result)?void 0:m.timed_out)?" Time budget reached.":"")+` ${e.updated} Model Advisor card(s) now have CV-checked code.`+" Only changes with a meaningful, consistent CV gain replace defaults; holdout accuracy can still differ.";break}if(["failed","cancelled","timed_out"].includes(a)){g=!0,E.textContent=`Fast tuning ${a}: `+String(null!=(p=null==t?void 0:t.error)?p:"");break}await new Promise(e=>setTimeout(e,1e3))}!g&&N()&&(E.textContent="Tuning is taking longer than expected. Check the job status before starting another run.")}catch(e){N()&&(E.textContent=`Fast Tune error: ${String(e)}`)}finally{S=!1,b.disabled=!1,w.disabled=!N(),C.disabled=!0,C.style.display="none"}})}_buildModelCard(e,t){var a,n,i,r,s,o,l,d,c,m,p;"string"==typeof e.defaultCode&&e.defaultCode.trim()||(e.defaultCode="string"==typeof e.code?e.code:"");let u=()=>{let t="string"==typeof e.defaultCode&&e.defaultCode.trim()?e.defaultCode:e.code;return"string"==typeof t?x(t):""},f=()=>{let t="string"==typeof e.tuned_code&&e.tuned_code.trim()?e.tuned_code:"string"==typeof e.code?e.code:e.defaultCode;return"string"==typeof t?x(t):""},h=null!=(a=({1:{bg:"#fef3c7",border:"#fde68a",text:"#b45309"},2:{bg:"#f1f5f9",border:"#cbd5e1",text:"#475569"},3:{bg:"#ffedd5",border:"#fed7aa",text:"#c2410c"}})[e.rank])?a:{bg:"#f8fafc",border:"#e2e8f0",text:"#64748b"},g=e.score>=85?"#059669":e.score>=70?"#d97706":"#dc2626",b=document.createElement("div");b.style.cssText=`
      border:1px solid ${1===e.rank?"#fde047":"#dfe3ea"};
      border-radius:12px; padding:16px; margin-bottom:12px;
      background:${1===e.rank?"#fffdf0":"#ffffff"};
      box-shadow: 0 1px 3px rgba(31, 41, 55, 0.04);
      position:relative;
    `;let _=document.createElement("div");if(_.style.cssText="display:flex; align-items:center; gap:10px; margin-bottom:12px;",_.innerHTML=`
      <span style="font-size:22px; line-height:1;">${e.medal}</span>
      <div style="flex:1;">
        <div style="font-size:14px; font-weight:800; display:flex; align-items:center; gap:8px; color:#1e293b;">
          ${e.name}
          ${e.rank<=3?`<span style="font-size:9px; padding:2px 8px; border-radius:99px; background:${h.bg}; color:${h.text}; border:1px solid ${h.border}; font-weight:700;">RANK #${e.rank}</span>`:""}
        </div>
        <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:5px;">
          ${(null!=(n=e.tags)?n:[]).map(e=>`<span style="font-size:9px; font-weight:600; padding:2px 8px; border-radius:99px; background:#eef2ff; border:1px solid #c7d2fe; color:#4338ca;">${e}</span>`).join("")}
        </div>
      </div>
      <div style="text-align:right; flex-shrink:0;">
        <div style="font-size:22px; font-weight:900; color:${g}; line-height:1;">${e.score}</div>
        <div style="font-size:9px; color:#64748b; font-weight:600;">/ 100</div>
      </div>
    `,b.appendChild(_),e.automl_measured){let t=_.lastElementChild;if(t){t.replaceChildren();let a=document.createElement("div");a.style.cssText="font-size:19px;font-weight:900;color:#059669;";let n=Number(e.measured_score),i="regression"===e.automl_task;a.textContent=Number.isFinite(n)?i?n.toFixed(4):`${(100*n).toFixed(2)}%`:"N/A";let r=document.createElement("div");r.style.cssText="font-size:10px;color:#64748b;font-weight:600;",r.textContent=i?"CV RMSE (lower is better)":"CV balanced accuracy",t.append(a,r)}}let v=document.createElement("div");v.style.cssText="height:6px; border-radius:99px; background:#e2e8f0; margin-bottom:12px; overflow:hidden;";let y=document.createElement("div");y.style.cssText=`height:100%; width:${e.score}%; border-radius:99px; background:linear-gradient(90deg, ${g}aa, ${g});`,v.appendChild(y),e.automl_measured||b.appendChild(v);let w=document.createElement("div");w.style.cssText=`
      font-size:11.5px; padding:12px 14px; border-radius:8px; margin-bottom:10px;
      background:#f0fdf4; border:1px solid #bbf7d0; color:#14532d; line-height:1.65; font-weight:500;
    `;let k=document.createElement("div");k.textContent="✅ Why this model",k.style.cssText="color:#15803d;font-weight:800;font-size:12.5px;margin-bottom:6px;display:flex;align-items:center;gap:5px;";let E=document.createElement("div");E.style.cssText="display:flex;flex-direction:column;gap:5px;margin-top:4px;";let $=String(null!=(i=e.why)?i:""),T=$.split("\n").filter(e=>e.trim().length>0),S=Array.isArray(e.reasons)&&e.reasons.length>0?e.reasons:C(String(null!=(r=e.name)?r:""),{name:String(null!=(s=e.name)?s:""),task:"regression"===e.automl_task||"regression"===e.task?"regression":"classification",metric:"",rank:null!=(o=e.rank)?o:1,finalistCount:5,targetColumn:t});if(T.length>1)T.forEach(e=>{let t=document.createElement("div");t.style.cssText="display:flex;align-items:flex-start;gap:6px;font-size:11px;line-height:1.5;";let a="•",n="",i=e;if(e.startsWith("Result:"))a="\uD83D\uDCCA",n="Score & Rank:",i=e.slice(7).trim(),t.innerHTML=`<span style="flex-shrink:0;font-size:11px;">${a}</span><div style="color:#166534;"><strong style="color:#15803d;font-weight:700;">${n}</strong> ${i}</div>`,E.appendChild(t);else if(e.startsWith("Model fit:"))if(S.length>0){t.style.cssText="margin:3px 0 4px 0;";let e=S.map(e=>`<div style="display:flex;align-items:flex-start;gap:6px;color:#166534;font-size:11px;line-height:1.45;"><span style="color:#15803d;font-weight:800;flex-shrink:0;">•</span><span>${e}</span></div>`).join("");t.innerHTML=`
              <div style="width:100%;">
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
                  <span style="flex-shrink:0;font-size:11px;">🧠</span>
                  <strong style="color:#15803d;font-weight:750;font-size:11.5px;">Why this model was selected:</strong>
                </div>
                <div style="display:flex;flex-direction:column;gap:3px;padding-left:18px;">
                  ${e}
                </div>
              </div>
            `,E.appendChild(t)}else a="\uD83E\uDDE0",n="Why this model:",i=e.slice(10).trim(),t.innerHTML=`<span style="flex-shrink:0;font-size:11px;">${a}</span><div style="color:#166534;"><strong style="color:#15803d;font-weight:700;">${n}</strong> ${i}</div>`,E.appendChild(t);else e.startsWith("Data:")?(a="\uD83D\uDCC1",n="Dataset match:",i=e.slice(5).trim(),t.innerHTML=`<span style="flex-shrink:0;font-size:11px;">${a}</span><div style="color:#166534;"><strong style="color:#15803d;font-weight:700;">${n}</strong> ${i}</div>`,E.appendChild(t)):e.startsWith("Comparison:")?(a="⚖️",n="Benchmark:",i=e.slice(11).trim(),t.innerHTML=`<span style="flex-shrink:0;font-size:11px;">${a}</span><div style="color:#166534;"><strong style="color:#15803d;font-weight:700;">${n}</strong> ${i}</div>`,E.appendChild(t)):e.startsWith("Decision:")&&(a="\uD83C\uDFAF",n="Next step:",i=e.slice(9).trim(),t.innerHTML=`<span style="flex-shrink:0;font-size:11px;">${a}</span><div style="color:#166534;"><strong style="color:#15803d;font-weight:700;">${n}</strong> ${i}</div>`,E.appendChild(t))});else if(S.length>0){let e=document.createElement("div");e.style.cssText="display:flex;align-items:center;gap:6px;margin-bottom:4px;",e.innerHTML=`<span style="flex-shrink:0;font-size:11px;">🧠</span><strong style="color:#15803d;font-weight:750;font-size:11.5px;">Why this model was selected:</strong>`;let t=document.createElement("div");if(t.style.cssText="display:flex;flex-direction:column;gap:3px;padding-left:18px;",t.innerHTML=S.map(e=>`<div style="display:flex;align-items:flex-start;gap:6px;color:#166534;font-size:11px;line-height:1.45;"><span style="color:#15803d;font-weight:800;flex-shrink:0;">•</span><span>${e}</span></div>`).join(""),E.append(e,t),$){let e=document.createElement("div");e.style.cssText="color:#166534;font-size:10.5px;margin-top:4px;",e.textContent=$,E.appendChild(e)}}else E.textContent=$,E.style.color="#166534",E.style.whiteSpace="pre-line";if(w.append(k,E),e.automl_measured&&Array.isArray(e.why_evidence)&&e.why_evidence.length>0){let t=document.createElement("details");t.style.marginTop="10px",t.style.paddingTop="8px",t.style.borderTop="1px solid #bbf7d0";let a=document.createElement("summary");a.textContent="\uD83D\uDD0D View detailed evaluation metrics, class balance & fold breakdown",a.style.cssText="font-weight:750;color:#15803d;cursor:pointer;font-size:11px;user-select:none;";let n=document.createElement("ul");for(let t of(n.style.cssText="margin:6px 0 0;padding-left:18px;color:#166534;font-size:10.5px;line-height:1.5;",e.why_evidence)){let e=document.createElement("li");e.textContent=String(t),e.style.marginTop="4px",n.appendChild(e)}if(t.append(a,n),"string"==typeof e.why_confidence&&e.why_confidence){let a=document.createElement("div");a.textContent=`💡 How to interpret it: ${e.why_confidence}`,a.style.cssText="margin-top:9px;padding-top:7px;border-top:1px dashed #bbf7d0;font-weight:600;font-size:10.5px;color:#14532d;line-height:1.5;",t.appendChild(a)}w.appendChild(t)}b.appendChild(w);let N=e.dependency_status;if(N&&!1===N.available&&"string"==typeof N.optional_dependency){let e=document.createElement("div");e.style.cssText=`
        padding:10px 12px;
        margin-bottom:10px;
        border-radius:8px;
        background:#fff7ed;
        border:1px solid #fed7aa;
        color:#9a3412;
        font-size:11px;
        line-height:1.6;
      `;let t=document.createElement("div");t.style.fontWeight="700",t.textContent="Optional ML package unavailable";let a=document.createElement("div");a.textContent="string"==typeof N.message?N.message:"This model requires an additional Python package.";let n=document.createElement("div");if(n.style.marginTop="4px",n.textContent="Availability is checked on the ModelMind server. Your notebook kernel may use a different environment.",e.appendChild(t),e.appendChild(a),e.appendChild(n),Array.isArray(N.alternatives)&&N.alternatives.length>0){let t=document.createElement("div");t.style.marginTop="6px",t.textContent="Available-library alternatives to consider: "+N.alternatives.filter(e=>"string"==typeof e).join(", "),e.appendChild(t)}b.appendChild(e)}let M=document.createElement("div");M.style.cssText="display:grid; grid-template-columns:repeat(3,1fr); gap:6px; margin-bottom:10px;",[["Training Speed",null!=(l=e.training_speed)?l:"—"],["Complexity",null!=(d=e.complexity)?d:"—"],["Interpretability",null!=(c=e.interpretability)?c:"—"]].forEach(([e,t])=>{let a=document.createElement("div");a.style.cssText="padding:8px 10px; border-radius:8px; background:#f8fafc; border:1px solid #e2e8f0; font-size:10px;",a.innerHTML=`<div style="color:#64748b; font-size:9px; font-weight:600; text-transform:uppercase; margin-bottom:3px;">${e}</div><div style="font-weight:700; color:#0f172a;">${t}</div>`,M.appendChild(a)}),b.appendChild(M);let A=document.createElement("div");A.style.cssText="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:10px;";let L=document.createElement("div");L.style.cssText="padding:10px; border-radius:8px; background:#f0fdf4; border:1px solid #bbf7d0;",L.innerHTML=`
      <div style="font-size:10.5px; font-weight:700; color:#15803d; margin-bottom:6px;">✅ Strengths</div>
      ${(null!=(m=e.strengths)?m:[]).map(e=>`<div style="font-size:10px; color:#166534; margin-bottom:3px; line-height:1.4;">• ${e}</div>`).join("")}
    `;let z=document.createElement("div");z.style.cssText="padding:10px; border-radius:8px; background:#fef2f2; border:1px solid #fecaca;",z.innerHTML=`
      <div style="font-size:10.5px; font-weight:700; color:#b91c1c; margin-bottom:6px;">⚠️ Weaknesses</div>
      ${(null!=(p=e.weaknesses)?p:[]).map(e=>`<div style="font-size:10px; color:#991b1b; margin-bottom:3px; line-height:1.4;">• ${e}</div>`).join("")}
    `,A.append(L,z),b.appendChild(A);let P=document.createElement("div");P.style.cssText="font-size:11px; color:#475569; margin-bottom:12px; padding:7px 10px; border-radius:6px; background:#f8fafc; border:1px solid #e2e8f0; line-height:1.4;",P.innerHTML=`<b style="color:#1e293b;">Best for:</b> ${e.best_for}`,b.appendChild(P);let F=document.createElement("div"),R=!1,I=document.createElement("button");I.type="button",I.className="mm-studio-btn mm-btn-sm",I.innerHTML="\uD83D\uDCC4 Show Full Code";let j=document.createElement("pre");j.style.cssText=`
      background:#ffffff; border:1px solid #dfe3ea; border-radius:8px;
      padding:14px 16px; font-size:10.5px; line-height:1.7;
      font-family:ui-monospace,SFMono-Regular,'Cascadia Code',monospace;
      color:#1e293b; overflow-x:auto; margin:8px 0 0 0; white-space:pre; display:none;
    `,j.textContent=u()||"# No code available",I.addEventListener("click",()=>{R=!R,j.textContent=u()||"# No code available",j.style.display=R?"block":"none",I.innerHTML=R?"\uD83D\uDD3C Hide Code":"\uD83D\uDCC4 Show Full Code"}),F.appendChild(I),F.appendChild(j),b.appendChild(F);let q=document.createElement("div");q.style.cssText="display:none; padding:10px 14px; border-radius:8px; margin-top:12px; background:#ecfdf5; border:1px solid #6ee7b7; color:#065f46; font-size:11.5px; line-height:1.5;";let O=document.createElement("div");O.style.cssText="display:flex; gap:8px; margin-top:10px; flex-wrap:wrap;";let D=document.createElement("button");D.type="button",D.className="mm-studio-btn mm-btn-sm",D.innerHTML="\uD83D\uDD0D Preview Code",D.addEventListener("click",()=>{this._showCodePreviewModal(e.name+" (Baseline)",u(),1===e.rank?"advanced":2===e.rank?"medium":"basic")});let H=document.createElement("button");H.type="button",H.className="mm-studio-btn mm-btn-sm",H.innerHTML="\uD83D\uDCCB Copy Code",H.addEventListener("click",async()=>{await navigator.clipboard.writeText(u()),H.textContent="Copied!",setTimeout(()=>{H.innerHTML="\uD83D\uDCCB Copy Code"},1500)});let B=document.createElement("button");if(B.type="button",B.className="mm-studio-btn mm-btn-sm mm-btn-primary",B.innerHTML="\uD83D\uDCE5 Insert into Notebook",B.title="Insert the clean baseline model code into your notebook",B.addEventListener("click",()=>{let t=this._insertCodeBelow(u());this._showToast(t?`✓ ${e.name} baseline code inserted! (Ready for manual parameter changes)`:"Open a notebook first.")}),e.refreshCode=()=>{var t;let a=!!u();if(j.textContent=u()||"# No code available",I.disabled=!a,D.disabled=!a,H.disabled=!a,B.disabled=!a,e.tuned_configuration_applied){b.style.borderColor="#10b981",b.style.boxShadow="0 0 0 1px #10b981, 0 3px 10px rgba(16, 185, 129, 0.12)",B.innerHTML="\uD83D\uDCE5 Insert Baseline Code into Notebook",q.replaceChildren(),q.style.display="block";let a=document.createElement("div");a.style.cssText="font-weight:700; color:#047857; margin-bottom:4px; display:flex; align-items:center; gap:6px; font-size:12px;",a.innerHTML="<span>⚡ Hyperparameter Tuning Recommendations:</span>";let n=document.createElement("div");n.style.cssText="font-size:11px; color:#14532d; margin-top:4px; line-height:1.6;";let i=e=>null===e?"None":"string"==typeof e?`"${e}"`:JSON.stringify(e);Array.isArray(e.tuned_changes)&&e.tuned_changes.length>0?e.tuned_changes.forEach(e=>{let t=document.createElement("div");t.innerHTML=`• <b>${e.parameter}</b>: change from <code>${i(e.default)}</code> → <code>${i(e.recommended)}</code>`,n.appendChild(t)}):e.tuned_params&&Object.entries(e.tuned_params).forEach(([e,t])=>{let a=document.createElement("div");a.innerHTML=`• <b>${e}</b>: recommended value <code>${i(t)}</code>`,n.appendChild(a)}),0===n.childElementCount&&"defaults_recommended"===e.tuned_recommendation_status?n.textContent="Default parameters are the best-supported choice: no tested alternative beat the baseline by a meaningful, consistent margin on the same CV folds.":0===n.childElementCount&&"insufficient_validation"===e.tuned_recommendation_status?n.textContent="Defaults were retained because there were not enough CV folds to support a reliable tuning decision.":0===n.childElementCount&&(n.textContent="No parameter changes were validated. The generated code preserves the baseline settings.");let r=document.createElement("div");r.style.cssText="font-size:10.5px; color:#475569; margin-top:6px; line-height:1.4;",r.innerHTML="<b>Evaluation note:</b> The recommended code applies the tested estimator settings; when defaults are recommended, it uses the same estimator settings as baseline code. Its held-out score can differ from CV, and no tuning search can guarantee higher accuracy on new data.";let s=document.createElement("div");s.style.cssText="display:flex; gap:8px; margin-top:8px; align-items:center; flex-wrap:wrap;";let o=document.createElement("button");o.type="button",o.className="mm-studio-btn mm-btn-sm",o.textContent="\uD83D\uDD0D Preview Recommended Code",o.addEventListener("click",()=>{this._showCodePreviewModal(e.name+" (Recommended)",f(),"advanced")});let l=document.createElement("button");l.type="button",l.className="mm-studio-btn mm-btn-sm",l.style.cssText="background:#f0fdf4; border:1px solid #86efac; color:#15803d; font-weight:600; font-size:10.5px; cursor:pointer;",l.innerHTML=(null==(t=e.tuned_changes)?void 0:t.length)?"⚡ Insert CV-Selected Code":"⚡ Insert Recommended Default Code",l.addEventListener("click",()=>{let t=this._insertCodeBelow(f());this._showToast(t?`✓ Tuned ${e.name} code inserted!`:"Open a notebook first.")}),this._canUseCodeAction("insert")?s.append(l):s.append(o),q.append(a,n,r,s)}else b.style.borderColor=1===e.rank?"#fde047":"#dfe3ea",b.style.boxShadow="0 1px 3px rgba(31, 41, 55, 0.04)",B.innerHTML="\uD83D\uDCE5 Insert into Notebook",q.style.display="none",q.replaceChildren()},e.automl_measured&&!e.code_available){I.disabled=!0,D.disabled=!0,H.disabled=!0,B.disabled=!0;let t=document.createElement("div");t.style.cssText="font-size:11px;color:#b45309;margin-top:8px;",t.textContent=e.code_error||"Executable code is unavailable.",b.appendChild(t)}return this._canUseCodeAction("insert")?O.append(D,H,B):O.append(D),b.append(q,O),e.refreshCode(),b}_renderModelLabTab(){let e=document.createDocumentFragment(),t=document.createElement("div");t.className="mm-studio-section",t.innerHTML=`
      <div class="mm-studio-sec-title"><span>⚗️</span> Model Visualization Lab</div>
      <div class="mm-studio-sec-sub">Interactive visualizers for foundational machine learning algorithms.</div>
    `,e.appendChild(t);let a=document.createElement("div");a.className="mm-studio-level-row";let n="gd",i=document.createElement("div");i.className="mm-lab-model-container",[{id:"gd",label:"\uD83D\uDCC9 Gradient Descent"},{id:"tree",label:"\uD83C\uDF33 Decision Tree"},{id:"knn",label:"\uD83D\uDD35 KNN"},{id:"kmeans",label:"\uD83D\uDD2E K-Means"},{id:"pca",label:"\uD83D\uDCD0 PCA"}].forEach(e=>{let t=document.createElement("button");t.type="button",t.className=`mm-level-pill ${e.id===n?"active":""}`,t.textContent=e.label,t.addEventListener("click",()=>{n=e.id,a.querySelectorAll("button").forEach(e=>e.classList.remove("active")),t.classList.add("active"),this._renderSelectedModel(i,n)}),a.appendChild(t)}),e.appendChild(a),e.appendChild(i),this._contentArea.appendChild(e),this._renderSelectedModel(i,n)}_renderSelectedModel(e,t){e.replaceChildren(),"gd"===t?this._renderGradientDescentLab(e):"tree"===t?this._renderDecisionTreeLab(e):"knn"===t?this._renderKNNLab(e):"kmeans"===t?this._renderKMeansLab(e):"pca"===t&&this._renderPCALab(e)}_renderGradientDescentLab(e){let t=document.createElement("div");t.className="mm-studio-card";let a=.1,n=.5,i=.05,r=0,s=!1,o=null,l=[{x:.1,y:1.1},{x:.2,y:1.5},{x:.3,y:1.6},{x:.4,y:1.9},{x:.5,y:2.1},{x:.6,y:2.2},{x:.7,y:2.6},{x:.8,y:2.7},{x:.9,y:2.9}],d=[],c=(e,t)=>{let a=0;return l.forEach(n=>{let i=e*n.x+t;a+=Math.pow(i-n.y,2)}),a/l.length},m=()=>{let e=0,t=0,s=l.length;l.forEach(i=>{let r=a*i.x+n-i.y;e+=2/s*r*i.x,t+=2/s*r}),a-=i*e,n-=i*t,r++,d.push(c(a,n)),w()};t.innerHTML=`
      <div style="font-weight:700; font-size:13px; margin-bottom:8px; display:flex; justify-content:space-between;">
        <span>Gradient Descent Regression Simulator</span>
        <span class="mm-studio-badge badge-num">Optimization</span>
      </div>
      <div style="font-size:11px; opacity:.7; margin-bottom:12px;">Watch the regression line fit the data and loss minimize step-by-step.</div>

      \x3c!-- Controls --\x3e
      <div class="mm-lab-controls">
        <label class="mm-lab-ctrl-row">
          <span>Learning Rate (α): <b id="gd-lr-val">${i}</b></span>
          <input type="range" id="gd-lr" min="0.01" max="0.2" step="0.01" value="${i}" />
        </label>
        <div style="display:flex; gap:6px; margin-top:8px;">
          <button type="button" class="mm-studio-btn mm-btn-sm mm-btn-primary" id="gd-play">▶ Play</button>
          <button type="button" class="mm-studio-btn mm-btn-sm" id="gd-step">⏭ Step</button>
          <button type="button" class="mm-studio-btn mm-btn-sm" id="gd-reset">🔄 Reset</button>
        </div>
      </div>

      \x3c!-- Live metrics --\x3e
      <div class="mm-studio-stats-grid" style="margin-top:10px;">
        <div class="mm-stat-box"><div class="mm-stat-val" id="gd-epoch">0</div><div class="mm-stat-lbl">Epoch</div></div>
        <div class="mm-stat-box"><div class="mm-stat-val" id="gd-w">0.10</div><div class="mm-stat-lbl">Weight (w)</div></div>
        <div class="mm-stat-box"><div class="mm-stat-val" id="gd-b">0.50</div><div class="mm-stat-lbl">Bias (b)</div></div>
        <div class="mm-stat-box"><div class="mm-stat-val" id="gd-loss" style="color:#f87171;">—</div><div class="mm-stat-lbl">MSE Loss</div></div>
      </div>

      \x3c!-- Canvas for Plot --\x3e
      <div style="margin-top:12px; border:1px solid #dfe3ea; border-radius:8px; overflow:hidden; background:#ffffff; padding:8px;">
        <div style="font-size:10px; font-weight:600; color:#64748b; margin-bottom:4px;">Regression Line & Data Points</div>
        <svg id="gd-canvas" viewBox="0 0 300 160" style="width:100%; height:160px; display:block;"></svg>
      </div>
    `,e.appendChild(t);let p=t.querySelector("#gd-canvas"),u=t.querySelector("#gd-epoch"),f=t.querySelector("#gd-w"),h=t.querySelector("#gd-b"),g=t.querySelector("#gd-loss"),b=t.querySelector("#gd-lr"),x=t.querySelector("#gd-lr-val"),_=t.querySelector("#gd-play"),v=t.querySelector("#gd-step"),y=t.querySelector("#gd-reset");b.addEventListener("input",()=>{x.textContent=(i=parseFloat(b.value)).toFixed(2)});let w=()=>{u.textContent=String(r),f.textContent=a.toFixed(2),h.textContent=n.toFixed(2),g.textContent=c(a,n).toFixed(4);let e=e=>136-e/3.5*112,t=`
        <line x1="24" y1="136" x2="276" y2="136" stroke="#334155" stroke-width="1"/>
        <line x1="24" y1="24" x2="24" y2="136" stroke="#334155" stroke-width="1"/>
      `;l.forEach(a=>{t+=`<circle cx="${24+252*a.x}" cy="${e(a.y)}" r="4" fill="#818cf8"/>`});let i=0*a+n,s=+a+n;p.innerHTML=t+=`
        <line x1="${24}" y1="${e(i)}" x2="${276}" y2="${e(s)}"
          stroke="#34d399" stroke-width="2.5" stroke-linecap="round"/>
      `};v.addEventListener("click",()=>m()),_.addEventListener("click",()=>{_.textContent=(s=!s)?"⏸ Pause":"▶ Play",_.className=s?"mm-studio-btn mm-btn-sm mm-btn-accent":"mm-studio-btn mm-btn-sm mm-btn-primary",s?o=setInterval(()=>{if(r>=100){clearInterval(o),s=!1,_.textContent="▶ Play";return}m()},100):clearInterval(o)}),y.addEventListener("click",()=>{clearInterval(o),s=!1,_.textContent="▶ Play",a=.1,n=.5,r=0,d.length=0,w()}),w()}_renderDecisionTreeLab(e){let t=document.createElement("div");t.className="mm-studio-card",t.innerHTML=`
      <div style="font-weight:700; font-size:13px; margin-bottom:8px; display:flex; justify-content:space-between;">
        <span>Decision Tree Node Split Visualizer</span>
        <span class="mm-studio-badge badge-cat">Classification</span>
      </div>
      <div style="font-size:11px; opacity:.7; margin-bottom:12px;">Visualize how a tree splits data on features to minimize impurity.</div>

      <div class="mm-tree-diagram">
        <div class="mm-tree-node root">
          <div class="mm-node-title">Root Node [Petal Length ≤ 2.45]</div>
          <div class="mm-node-meta">Gini = 0.667 • Samples = 150</div>
        </div>
        <div class="mm-tree-branches">
          <div class="mm-tree-branch">
            <div class="mm-branch-label">True</div>
            <div class="mm-tree-node leaf leaf-a">
              <div class="mm-node-title">Setosa (Class 0)</div>
              <div class="mm-node-meta">Gini = 0.0 • Samples = 50</div>
            </div>
          </div>
          <div class="mm-tree-branch">
            <div class="mm-branch-label">False</div>
            <div class="mm-tree-node internal">
              <div class="mm-node-title">[Petal Width ≤ 1.75]</div>
              <div class="mm-node-meta">Gini = 0.50 • Samples = 100</div>
              <div class="mm-tree-subbranches">
                <div class="mm-tree-node leaf leaf-b">Versicolor (49/5)</div>
                <div class="mm-tree-node leaf leaf-c">Virginica (1/45)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,e.appendChild(t)}_renderKNNLab(e){let t=document.createElement("div");t.className="mm-studio-card",t.innerHTML=`
      <div style="font-weight:700; font-size:13px; margin-bottom:8px; display:flex; justify-content:space-between;">
        <span>k-Nearest Neighbors (KNN) 2D Space</span>
        <span class="mm-studio-badge badge-cat">Instance-Based</span>
      </div>
      <div style="font-size:11px; opacity:.7; margin-bottom:12px;">Click anywhere on the 2D grid to predict its class using k nearest neighbors.</div>

      <label class="mm-lab-ctrl-row">
        <span>k Neighbors: <b id="knn-k-val">3</b></span>
        <input type="range" id="knn-k" min="1" max="9" step="2" value="3" />
      </label>

      <div style="margin-top:10px; border:1px solid #dfe3ea; border-radius:8px; background:#ffffff; overflow:hidden;">
        <svg id="knn-svg" viewBox="0 0 300 180" style="width:100%; height:180px; display:block; cursor:crosshair;"></svg>
      </div>
      <div id="knn-pred-box" style="margin-top:8px; font-size:11px; font-weight:700; text-align:center; color:#0284c7;">
        Click the plot to classify a query point!
      </div>
    `,e.appendChild(t);let a=t.querySelector("#knn-svg"),n=t.querySelector("#knn-k"),i=t.querySelector("#knn-k-val"),r=t.querySelector("#knn-pred-box"),s=3,o={x:150,y:90},l=[{x:50,y:50},{x:70,y:70},{x:80,y:40},{x:100,y:60},{x:90,y:90},{x:60,y:110}],d=[{x:220,y:130},{x:240,y:150},{x:210,y:160},{x:200,y:120},{x:250,y:110},{x:180,y:140}],c=()=>{let e="";if(l.forEach(t=>{e+=`<circle cx="${t.x}" cy="${t.y}" r="5" fill="#38bdf8" />`}),d.forEach(t=>{e+=`<circle cx="${t.x}" cy="${t.y}" r="5" fill="#f59e0b" />`}),o){let t=[...l.map(e=>({...e,cls:"Class A (Blue)"})),...d.map(e=>({...e,cls:"Class B (Amber)"}))];t.sort((e,t)=>Math.hypot(e.x-o.x,e.y-o.y)-Math.hypot(t.x-o.x,t.y-o.y));let a=t.slice(0,s),n=Math.hypot(a[a.length-1].x-o.x,a[a.length-1].y-o.y);e+=`<circle cx="${o.x}" cy="${o.y}" r="${n}" fill="none" stroke="#a78bfa" stroke-dasharray="4" stroke-width="1.5"/>`,a.forEach(t=>{e+=`<line x1="${o.x}" y1="${o.y}" x2="${t.x}" y2="${t.y}" stroke="#a78bfa" stroke-width="1" opacity="0.6"/>`}),e+=`<circle cx="${o.x}" cy="${o.y}" r="6" fill="#ec4899" stroke="#fff" stroke-width="2"/>`;let i=a.filter(e=>e.cls.includes("Class A")).length,c=s-i;r.innerHTML=`Predicted: <span style="color:${i>c?"#38bdf8":"#f59e0b"}">${i>c?"Class A (Blue)":"Class B (Amber)"}</span> (${i} vs ${c} votes)`}a.innerHTML=e};n.addEventListener("input",()=>{i.textContent=String(s=parseInt(n.value)),c()}),a.addEventListener("click",e=>{let t=a.getBoundingClientRect();o={x:(e.clientX-t.left)/t.width*300,y:(e.clientY-t.top)/t.height*180},c()}),c()}_renderKMeansLab(e){let t=document.createElement("div");t.className="mm-studio-card",t.innerHTML=`
      <div style="font-weight:700; font-size:13px; margin-bottom:8px; display:flex; justify-content:space-between;">
        <span>K-Means Clustering Simulator</span>
        <span class="mm-studio-badge badge-num">Clustering</span>
      </div>
      <div style="font-size:11px; opacity:.7; margin-bottom:12px;">Iteratively update cluster centroids to minimize within-cluster variance.</div>
      <div style="display:flex; gap:6px; margin-bottom:10px;">
        <button type="button" class="mm-studio-btn mm-btn-sm mm-btn-primary" id="km-step">Step Centroids</button>
        <button type="button" class="mm-studio-btn mm-btn-sm" id="km-reset">Reset</button>
      </div>
      <div style="border:1px solid #dfe3ea; border-radius:8px; background:#ffffff; overflow:hidden;">
        <svg id="km-svg" viewBox="0 0 300 160" style="width:100%; height:160px; display:block;"></svg>
      </div>
    `,e.appendChild(t);let a=t.querySelector("#km-svg"),n=t.querySelector("#km-step"),i=t.querySelector("#km-reset"),r=[{x:40,y:40},{x:50,y:60},{x:60,y:35},{x:70,y:65},{x:80,y:50},{x:220,y:120},{x:230,y:140},{x:240,y:110},{x:250,y:135},{x:210,y:130},{x:140,y:90},{x:150,y:110},{x:160,y:85}],s=[{x:50,y:120,color:"#38bdf8"},{x:200,y:50,color:"#f59e0b"}],o=()=>{let e="";r.forEach(t=>{let a=Math.hypot(t.x-s[0].x,t.y-s[0].y)<Math.hypot(t.x-s[1].x,t.y-s[1].y)?s[0].color:s[1].color;e+=`<circle cx="${t.x}" cy="${t.y}" r="4" fill="${a}" opacity="0.8"/>`}),s.forEach(t=>{e+=`
          <line x1="${t.x-6}" y1="${t.y-6}" x2="${t.x+6}" y2="${t.y+6}" stroke="${t.color}" stroke-width="3"/>
          <line x1="${t.x-6}" y1="${t.y+6}" x2="${t.x+6}" y2="${t.y-6}" stroke="${t.color}" stroke-width="3"/>
        `}),a.innerHTML=e};n.addEventListener("click",()=>{let e=r.filter(e=>Math.hypot(e.x-s[0].x,e.y-s[0].y)<=Math.hypot(e.x-s[1].x,e.y-s[1].y)),t=r.filter(e=>Math.hypot(e.x-s[0].x,e.y-s[0].y)>Math.hypot(e.x-s[1].x,e.y-s[1].y));e.length>0&&(s[0].x=e.reduce((e,t)=>e+t.x,0)/e.length,s[0].y=e.reduce((e,t)=>e+t.y,0)/e.length),t.length>0&&(s[1].x=t.reduce((e,t)=>e+t.x,0)/t.length,s[1].y=t.reduce((e,t)=>e+t.y,0)/t.length),o()}),i.addEventListener("click",()=>{s=[{x:50,y:120,color:"#38bdf8"},{x:200,y:50,color:"#f59e0b"}],o()}),o()}_renderPCALab(e){let t=document.createElement("div");t.className="mm-studio-card",t.innerHTML=`
      <div style="font-weight:700; font-size:13px; margin-bottom:8px; display:flex; justify-content:space-between;">
        <span>Principal Component Analysis (PCA)</span>
        <span class="mm-studio-badge badge-num">Dim Reduction</span>
      </div>
      <div style="font-size:11px; opacity:.7; margin-bottom:12px;">Projects high-dimensional data onto orthogonal axes of maximum variance.</div>

      <div style="font-size:11px; font-weight:600; margin-bottom:6px;">Variance Explained Ratio (Scree Plot):</div>
      <div class="mm-studio-bar-row">
        <div class="mm-studio-bar-label"><span>PC 1 (First Component)</span><span>72.8%</span></div>
        <div class="mm-studio-bar-track"><div class="mm-studio-bar-fill" style="width:72.8%; background:#818cf8;"></div></div>
      </div>
      <div class="mm-studio-bar-row">
        <div class="mm-studio-bar-label"><span>PC 2 (Second Component)</span><span>21.4%</span></div>
        <div class="mm-studio-bar-track"><div class="mm-studio-bar-fill" style="width:21.4%; background:#38bdf8;"></div></div>
      </div>
      <div class="mm-studio-bar-row">
        <div class="mm-studio-bar-label"><span>PC 3 (Residual)</span><span>5.8%</span></div>
        <div class="mm-studio-bar-track"><div class="mm-studio-bar-fill" style="width:5.8%; background:#64748b;"></div></div>
      </div>
    `,e.appendChild(t)}_renderGuideTab(){let e=document.createDocumentFragment(),t=document.createElement("div");t.className="mm-studio-section",t.innerHTML=`
      <div class="mm-studio-sec-title"><span>📖</span> Preprocessing & ML Handbook</div>
      <div class="mm-studio-sec-sub">Essential guides and best practices for robust data preparation.</div>
    `,e.appendChild(t);let a=document.createElement("section");a.className="mm-studio-card",a.setAttribute("aria-labelledby","mm-guide-install-title");let n=document.createElement("div");n.id="mm-guide-install-title",n.className="mm-studio-sec-title",n.textContent="\uD83D\uDCE6 Install ML Libraries";let i=document.createElement("div");i.className="mm-studio-sec-sub",i.style.marginTop="0",i.textContent="Copy this single command into a notebook code cell and run it to install the libraries in the active notebook kernel. Internet access is required; installation may take a while.";let r="%pip install numpy pandas scipy scikit-learn xgboost lightgbm catboost imbalanced-learn statsmodels joblib matplotlib seaborn plotly shap optuna",s=document.createElement("pre");s.style.cssText="background:#f8fafc;border:1px solid #dfe3ea;border-radius:8px;padding:10px 12px;margin:0;overflow-x:auto;white-space:pre;font:11px/1.6 ui-monospace,SFMono-Regular,monospace;color:#1e293b;",s.textContent=r;let o=document.createElement("button");o.type="button",o.className="mm-studio-btn mm-btn-sm mm-btn-primary",o.textContent="\uD83D\uDCCB Copy install command",o.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(r),o.textContent="Copied!",this._showToast("✓ Install command copied. Paste it into a notebook cell."),window.setTimeout(()=>{o.textContent="\uD83D\uDCCB Copy install command"},1800)}catch(e){this._showToast("Could not access the clipboard. Select and copy the command above.")}});let l=document.createElement("div");l.style.cssText="display:flex;gap:8px;flex-wrap:wrap;",l.appendChild(o);let d=document.createElement("button");if(d.type="button",d.className="mm-studio-btn mm-btn-sm",d.textContent="\uD83D\uDCE5 Insert into notebook",d.addEventListener("click",()=>{let e=this._insertCodeBelow(r);this._showToast(e?"✓ Install command inserted below the active cell. Run that cell to install the libraries.":"Open a notebook and select a cell before inserting the install command.")}),this._canUseCodeAction("copy"))l.appendChild(d);else{let e=document.createElement("button");e.type="button",e.className="mm-studio-btn mm-btn-sm",e.textContent="\uD83D\uDD0D Preview Code",e.addEventListener("click",()=>{this._showCodePreviewModal("ML library install command",r,"basic")}),l.replaceChildren(e)}a.append(n,i,s,l),e.appendChild(a),[{title:"1. Handling Missing Data (Imputation)",emoji:"\uD83E\uDE79",content:`
          • <b>MCAR (Missing Completely at Random):</b> Safe to drop if < 5% or use Mean/Median.<br/>
          • <b>MAR (Missing at Random):</b> Impute using KNN or IterativeImputer conditioned on other features.<br/>
          • <b>MNAR (Missing Not at Random):</b> Create a missingness indicator column before imputing.<br/>
          • <b>Rule of Thumb:</b> Use Median over Mean when data is skewed or contains outliers.
        `},{title:"2. Categorical Encoding Guide",emoji:"\uD83C\uDFF7️",content:`
          • <b>One-Hot Encoding:</b> Best for nominal data with low cardinality (< 10 unique values). Always set <code>handle_unknown='ignore'</code> for test data!<br/>
          • <b>Ordinal Encoding:</b> Use only when natural ranking exists (e.g. Low, Medium, High).<br/>
          • <b>Target / Frequency Encoding:</b> Best for high-cardinality features. Always compute inside CV loops to avoid leakage!
        `},{title:"3. Feature Scaling & Normalization",emoji:"⚖️",content:`
          • <b>StandardScaler:</b> Transforms features to mean=0, std=1. Essential for Logistic Regression, SVM, KNN, Neural Networks.<br/>
          • <b>RobustScaler:</b> Uses median and IQR. Best when features have extreme outliers.<br/>
          • <b>MinMaxScaler:</b> Bounds features strictly to [0, 1]. Best for image pixels or neural activations.<br/>
          • <b>Tree Models:</b> Random Forest and XGBoost do NOT require feature scaling.
        `},{title:"4. Outlier Detection & Treatment",emoji:"\uD83C\uDFAF",content:`
          • <b>IQR Rule:</b> Points outside [Q1 - 1.5\xd7IQR, Q3 + 1.5\xd7IQR] are potential outliers.<br/>
          • <b>Capping / Winsorization:</b> Clip values to 1st and 99th percentiles rather than deleting rows to preserve sample size.
        `},{title:"5. Preventing Data Leakage Checklist",emoji:"\uD83D\uDEE1️",content:`
          • Always call <code>train_test_split</code> BEFORE fitting any Scaler or Imputer!<br/>
          • Fit transformers on training data only (<code>fit_transform</code>), then only <code>transform</code> the test data.<br/>
          • Never include the target variable in feature matrices.
        `}].forEach(t=>{let a=document.createElement("div");a.className="mm-studio-card mm-guide-card",a.innerHTML=`
        <div class="mm-guide-hdr">
          <span>${t.emoji} ${t.title}</span>
        </div>
        <div class="mm-guide-body">${t.content}</div>
      `,e.appendChild(a)}),this._contentArea.appendChild(e)}_insertPreprocessingCode(e){let t=this._notebooks.currentWidget;return(null==t?void 0:t.content)?this._insertCodeBelow(e):(this._showToast("Open a notebook first."),!1)}_insertCodeBelow(e){let t=this._notebooks.currentWidget;if(!t)return!1;let a=t.content;if(!(null==a?void 0:a.model))return!1;let n=a.activeCell?a.activeCellIndex+1:a.model.cells.length;return a.model.sharedModel.insertCell(n,{cell_type:"code",source:e,metadata:{trusted:!0}}),a.activeCellIndex=n,!0}_createStatCard(e,t,a="default"){let n=document.createElement("div");n.className="mm-stat-box";let i=document.createElement("div");i.className="mm-stat-val","warn"===a&&(i.style.color="#f87171"),"ok"===a&&(i.style.color="#34d399"),i.textContent=String(t);let r=document.createElement("div");return r.className="mm-stat-lbl",r.textContent=e,n.append(i,r),n}_showToast(e){let t=document.createElement("div");t.className="mm-studio-toast",t.textContent=e,this._root.appendChild(t),setTimeout(()=>{t.classList.add("fade-out"),setTimeout(()=>t.remove(),400)},2200)}}let $=null,T=null,S=!1,N="basic",M=null,A=null,L=!0;function z(){if(document.getElementById("mm-tutor-styles"))return;let e=document.createElement("style");e.id="mm-tutor-styles",e.textContent=`
    /* ── Overlay ── */
    #mm-tutor-overlay {
      position: fixed; inset: 0;
      background: rgba(15, 23, 42, 0.45);
      backdrop-filter: blur(2px);
      z-index: 9998;
      opacity: 0; transition: opacity .25s ease;
      pointer-events: none; display: none;
    }
    #mm-tutor-overlay.open { opacity: 1; pointer-events: auto; display: block; }

    /* ── Panel — Unified with ModelMind AI Assistant ── */
    #mm-tutor-panel {
      position: fixed; right: 0; bottom: 0; top: 0; width: 420px; max-width: 96vw;
      background: var(--ml-assistant-panel-bg, #f5f6f8);
      border-left: 1px solid var(--ml-assistant-border, #dfe3ea);
      z-index: 9999; overflow-y: auto; transform: translateX(100%);
      transition: transform .28s cubic-bezier(.4, 0, .2, 1);
      display: flex; flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: var(--ml-assistant-text, #253041);
      box-shadow: -6px 0 24px var(--ml-assistant-shadow, rgba(31, 41, 55, 0.12));
    }
    #mm-tutor-panel.open { transform: translateX(0); }

    /* ── Header ── */
    #mm-tutor-header {
      padding: 14px 16px 12px;
      border-bottom: 1px solid var(--ml-assistant-border, #dfe3ea);
      background: #ffffff;
      position: sticky; top: 0; z-index: 2;
      display: flex; flex-direction: column; gap: 4px;
    }
    .mm-tutor-header-top {
      display: flex; align-items: center; justify-content: space-between;
    }
    #mm-tutor-header h2 {
      margin: 0; font-size: 15px; font-weight: 700;
      color: var(--ml-assistant-text, #253041);
      display: flex; align-items: center; gap: 8px;
    }
    #mm-tutor-header .sub {
      font-size: 11px;
      color: var(--ml-assistant-muted, #5d6b80);
      font-weight: 500;
    }
    #mm-tutor-close {
      background: transparent;
      border: 1px solid var(--ml-assistant-border, #dfe3ea);
      color: var(--ml-assistant-muted, #5d6b80);
      cursor: pointer; font-size: 16px; line-height: 1;
      padding: 4px 8px; border-radius: 6px;
      transition: all .15s ease;
    }
    #mm-tutor-close:hover {
      background: #f1f5f9;
      color: var(--ml-assistant-text, #253041);
      border-color: #cbd5e1;
    }

    /* ── Body ── */
    #mm-tutor-body, .mm-tutor-embedded-body {
      padding: 14px 16px; flex: 1;
      display: flex; flex-direction: column; gap: 10px;
    }

    /* ── Level Switcher Tabs (Basic / Medium / Advanced) ── */
    .mm-tutor-level-row {
      display: flex; gap: 6px;
      padding: 3px; background: #eaecf1;
      border-radius: 8px; margin-bottom: 6px;
    }
    .mm-tutor-level-btn {
      flex: 1; font-size: 12px; font-weight: 600; padding: 6px 10px;
      border-radius: 6px; cursor: pointer; text-align: center;
      border: none; background: transparent;
      color: var(--ml-assistant-muted, #5d6b80);
      transition: all .15s ease;
    }
    .mm-tutor-level-btn:hover {
      color: var(--ml-assistant-text, #253041);
    }
    .mm-tutor-level-btn.active {
      background: #ffffff;
      color: var(--ml-assistant-accent, #6d7cff);
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      font-weight: 700;
    }

    /* ── Error Banner ── */
    .mm-tutor-error-banner {
      background: var(--ml-assistant-error-bg, #f7dfe3);
      border: 1px solid rgba(163, 61, 77, 0.25);
      border-radius: 8px;
      padding: 12px 14px;
    }
    .mm-tutor-error-banner .banner-title {
      display: flex; align-items: center; gap: 8px;
      font-size: 13px; font-weight: 700;
      color: var(--ml-assistant-error-text, #a33d4d);
      margin-bottom: 3px;
    }
    .mm-tutor-error-banner .banner-type {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 11px; font-weight: 700;
      color: #991b1b;
    }
    .mm-tutor-error-banner .banner-msg {
      font-size: 12px; color: #7f1d1d; margin-top: 4px; line-height: 1.4;
      word-break: break-word;
    }
    .mm-tutor-error-banner .banner-line {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 11px; color: #b91c1c; margin-top: 6px;
      padding: 4px 8px; background: rgba(255,255,255,0.6);
      border-radius: 4px; overflow-x: auto;
    }

    /* ── Local Engine / Coverage Pill ── */
    .mm-tutor-coverage {
      display: inline-flex; align-items: center; gap: 6px;
      background: var(--ml-assistant-success-bg, #dff5eb);
      color: var(--ml-assistant-success-text, #1d7b54);
      border: 1px solid rgba(29, 123, 84, 0.2);
      border-radius: 6px; padding: 6px 10px;
      font-size: 11px; font-weight: 600;
    }
    .mm-tutor-coverage.mm-tutor-low-conf {
      background: #fef3c7;
      color: #92400e;
      border: 1px solid rgba(180, 83, 9, 0.3);
    }
    .mm-tutor-withheld-box {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 8px; padding: 12px 14px;
      margin: 2px 0 6px;
    }
    .mm-tutor-withheld-box .withheld-title {
      font-size: 12px; font-weight: 700; color: #92400e;
      margin-bottom: 4px; display: flex; align-items: center; gap: 6px;
    }
    .mm-tutor-withheld-box .withheld-desc {
      font-size: 11.5px; color: #78350f; line-height: 1.5;
    }
    .mm-tutor-ask-ai-btn {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      width: 100%; margin-top: 10px; padding: 9px 14px;
      background: var(--ml-assistant-accent, #6d7cff);
      color: #ffffff; border: none; border-radius: 6px;
      font-size: 12px; font-weight: 700; cursor: pointer;
      transition: all .15s ease;
      box-shadow: 0 2px 8px rgba(109, 124, 255, 0.35);
    }
    .mm-tutor-ask-ai-btn:hover {
      background: #5865f2;
      box-shadow: 0 4px 14px rgba(109, 124, 255, 0.5);
      transform: translateY(-1px);
    }

    /* ── Contextual Smart Hints ── */
    .mm-tutor-hint {
      background: var(--ml-assistant-accent-soft, #eef1ff);
      border: 1px solid rgba(109, 124, 255, 0.3);
      border-radius: 8px; padding: 10px 12px;
      font-size: 12px; color: #3730a3; line-height: 1.45;
    }

    /* ── Content Card (What / Why / How to fix) ── */
    .mm-tutor-section {
      background: var(--ml-assistant-card-bg, #ffffff);
      border: 1px solid var(--ml-assistant-border, #dfe3ea);
      border-radius: 8px; padding: 12px 14px;
      box-shadow: 0 1px 3px var(--ml-assistant-shadow, rgba(31, 41, 55, 0.04));
    }
    .mm-tutor-section-label {
      font-size: 10px; font-weight: 700; letter-spacing: 0.6px;
      color: var(--ml-assistant-muted, #5d6b80);
      margin-bottom: 6px; text-transform: uppercase;
    }
    .mm-tutor-section-content {
      font-size: 12.5px; color: var(--ml-assistant-text, #253041);
      line-height: 1.55;
    }

    /* ── Numbered Steps ── */
    .mm-tutor-step {
      display: flex; gap: 8px; margin-bottom: 6px;
      font-size: 12px; line-height: 1.5;
      color: var(--ml-assistant-text, #253041);
    }
    .mm-tutor-step-num {
      width: 18px; height: 18px; border-radius: 50%;
      background: var(--ml-assistant-accent-soft, #eef1ff);
      color: var(--ml-assistant-accent, #6d7cff);
      font-size: 10px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      margin-top: 1px; flex-shrink: 0;
    }

    /* ── Code Tip Block ── */
    .mm-tutor-code-wrap {
      position: relative; margin-top: 6px;
    }
    .mm-tutor-code-tip {
      background: #0f172a; border: 1px solid #1e293b;
      border-radius: 8px; padding: 12px;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 11.5px; line-height: 1.6; color: #e2e8f0;
      overflow-x: auto; white-space: pre;
    }
    .mm-tutor-copy-btn {
      position: absolute; top: 8px; right: 8px;
      font-size: 10px; font-weight: 600; padding: 4px 9px;
      border-radius: 5px; cursor: pointer;
      background: #334155; border: 1px solid #475569; color: #f8fafc;
      transition: all .12s ease;
    }
    .mm-tutor-copy-btn:hover { background: #475569; }

    /* ── Empty State & Quick Presets ── */
    .mm-tutor-empty {
      background: #ffffff;
      border: 1px solid var(--ml-assistant-border, #dfe3ea);
      border-radius: 8px; padding: 20px 16px; text-align: center;
    }
    .mm-tutor-empty h3 {
      margin: 8px 0 4px; font-size: 14px; font-weight: 700;
      color: var(--ml-assistant-text, #253041);
    }
    .mm-tutor-empty p {
      margin: 0 0 14px; font-size: 12px;
      color: var(--ml-assistant-muted, #5d6b80);
      line-height: 1.5;
    }
    .mm-tutor-preset-list {
      display: flex; flex-direction: column; gap: 6px;
      text-align: left; margin-top: 12px;
    }
    .mm-tutor-preset-btn {
      display: flex; align-items: center; justify-content: space-between;
      background: var(--ml-assistant-panel-bg, #f5f6f8);
      border: 1px solid var(--ml-assistant-border, #dfe3ea);
      border-radius: 6px; padding: 8px 10px;
      font-size: 11.5px; font-weight: 600;
      color: var(--ml-assistant-text, #253041);
      cursor: pointer; transition: all .15s ease;
    }
    .mm-tutor-preset-btn:hover {
      background: var(--ml-assistant-accent-soft, #eef1ff);
      border-color: rgba(109, 124, 255, 0.35);
      color: var(--ml-assistant-accent, #6d7cff);
    }

    /* ── FAB button ── */
    #mm-tutor-fab {
      position: fixed; right: 20px; bottom: 20px; z-index: 9997;
      width: 48px; height: 48px; border-radius: 50%; border: none; cursor: pointer;
      background: linear-gradient(135deg, #6d7cff 0%, #4f46e5 100%);
      color: #fff; font-size: 20px;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 16px rgba(109, 124, 255, 0.4);
      transition: transform .15s, box-shadow .15s;
    }
    #mm-tutor-fab:hover { transform: scale(1.08); box-shadow: 0 6px 22px rgba(109, 124, 255, 0.6); }
    #mm-tutor-fab .badge {
      position: absolute; top: -2px; right: -2px; width: 15px; height: 15px;
      border-radius: 50%; background: #ef4444; font-size: 9px; font-weight: 800;
      display: none; align-items: center; justify-content: center; color: #fff;
    }
    #mm-tutor-fab .badge.show { display: flex; }
  `,document.head.appendChild(e)}function P(){var e,t;if(z(),T||((T=document.createElement("div")).id="mm-tutor-overlay",T.addEventListener("click",R),document.body.appendChild(T)),!$){let a;($=document.createElement("div")).id="mm-tutor-panel",$.setAttribute("role","dialog"),$.setAttribute("aria-label","AI Debugger Tutor");let n=document.createElement("div");n.id="mm-tutor-header",n.innerHTML=`
      <div class="mm-tutor-header-top">
        <h2>🎓 AI Debugger Tutor</h2>
        <button id="mm-tutor-close" aria-label="Close tutor panel">✕</button>
      </div>
      <div class="sub">100% Offline \xb7 No AI required \xb7 ~80% ML Error Coverage</div>
    `,null==(e=n.querySelector("#mm-tutor-close"))||e.addEventListener("click",R),$.appendChild(n);let i=document.createElement("div");i.id="mm-tutor-body",(t=i).replaceChildren(),(a=document.createElement("div")).className="mm-tutor-empty",a.innerHTML=`
    <div style="font-size:32px">🎓</div>
    <h3>AI Debugger Tutor Ready</h3>
    <p>Run any failing notebook cell, and the Tutor will instantly explain what happened with <strong>Basic</strong>, <strong>Medium</strong>, and <strong>Advanced</strong> fixes — 100% offline.</p>
    <div class="mm-tutor-coverage">🔒 Local Engine \xb7 Zero API Latency \xb7 ~80% ML Coverage</div>
    <div class="mm-tutor-preset-list">
      <div style="font-size:11px;font-weight:700;color:#5d6b80;text-transform:uppercase;margin-bottom:2px">Try Example Scenarios:</div>
      <button type="button" class="mm-tutor-preset-btn" data-type="ValueError" data-msg="Input X contains NaN.">
        <span>⚡ NaN in Model Fit (ValueError)</span>
        <span style="color:#6d7cff">Inspect →</span>
      </button>
      <button type="button" class="mm-tutor-preset-btn" data-type="KeyError" data-msg="KeyError: 'target'">
        <span>⚡ Missing Column 'target' (KeyError)</span>
        <span style="color:#6d7cff">Inspect →</span>
      </button>
      <button type="button" class="mm-tutor-preset-btn" data-type="NameError" data-msg="name 'X_train' is not defined">
        <span>⚡ Undefined 'X_train' (NameError)</span>
        <span style="color:#6d7cff">Inspect →</span>
      </button>
      <button type="button" class="mm-tutor-preset-btn" data-type="ValueError" data-msg="Found input variables with inconsistent numbers of samples: [100, 80]">
        <span>⚡ Shape Mismatch [100, 80] (ValueError)</span>
        <span style="color:#6d7cff">Inspect →</span>
      </button>
    </div>
  `,a.querySelectorAll(".mm-tutor-preset-btn").forEach(e=>{e.addEventListener("click",()=>{let t=e.getAttribute("data-type")||"ValueError",a=e.getAttribute("data-msg")||"Error";A&&q({error_type:t,error_message:a,traceback:`${t}: ${a}`,code:"model.fit(X_train, y_train)"},A,!0)})}),t.appendChild(a),$.appendChild(i),document.body.appendChild($)}}function F(){$||P(),$.classList.add("open"),null==T||T.classList.add("open"),S=!0}function R(){null==$||$.classList.remove("open"),null==T||T.classList.remove("open"),S=!1}function I(){S?R():F()}function j(e){L=e,e||R();let t=e?"":"none";for(let e of["mm-tutor-fab","mm-tutor-panel","mm-tutor-overlay"]){let a=document.getElementById(e);a&&(a.style.display=t)}}async function q(e,t,a=!1){if(!L)return;M=e,A=t,z(),$||P(),a&&F();let n=$.querySelector("#mm-tutor-body");if(n){n.replaceChildren();let e=document.createElement("div");e.style.textAlign="center",e.style.padding="30px 16px",e.style.color="#5d6b80",e.innerHTML='<div style="font-size:28px;margin-bottom:8px">⏳</div>Analysing with Local ML Engine…',n.appendChild(e)}try{var i;let a,r=await f("api/ai/tutor",t,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({error_type:e.error_type,error_message:e.error_message,traceback:e.traceback,code:e.code,level:N})});if(!L)return;n&&function(e,t){var a,n,i,r,s,o,l,d;if(e.replaceChildren(),!t.handled){let n=document.createElement("div");n.className="mm-tutor-empty",n.innerHTML=`
      <div style="font-size:28px">🤔</div>
      <h3>Error Not Diagnosed</h3>
      <p>${null!=(a=t.error_message)?a:"Could not automatically analyse this error offline."}</p>
    `,e.appendChild(n);return}let c=document.createElement("div");c.className="mm-tutor-level-row",["basic","medium","advanced"].forEach(e=>{let t=document.createElement("button");t.type="button",t.className=`mm-tutor-level-btn${e===N?" active":""}`,t.textContent=({basic:"\uD83D\uDC23 Basic Fix",medium:"⚡ Medium (M02)",advanced:"\uD83D\uDE80 Pipeline (Adv)"})[e],t.addEventListener("click",()=>{N=e,M&&A&&q(M,A,!0)}),c.appendChild(t)}),e.appendChild(c);let m=document.createElement("div");m.className="mm-tutor-error-banner",m.innerHTML=`
    <div class="banner-title">
      <span style="font-size:16px">${null!=(n=t.icon)?n:"\uD83D\uDC1B"}</span>
      <span>${null!=(i=t.title)?i:"Runtime Error"}</span>
    </div>
    <div class="banner-type">${null!=(r=t.error_type)?r:""}</div>
    ${t.error_message?`<div class="banner-msg">${t.error_message}</div>`:""}
    ${t.failing_line?`<div class="banner-line">→ ${t.failing_line}</div>`:""}
  `,e.appendChild(m);let p=!0===t.can_suggest_code&&(null!=(s=t.confidence)?s:0)>=70,u=document.createElement("div");if(u.className=p?"mm-tutor-coverage":"mm-tutor-coverage mm-tutor-low-conf",u.innerHTML=p?`🟢 <strong>Confidence: ${null!=(o=t.confidence)?o:85}%</strong> (≥70% High) \xb7 Level: <strong>${N.toUpperCase()}</strong>`:`⚠️ <strong>Confidence: ${null!=(l=t.confidence)?l:45}%</strong> (<70% Threshold) \xb7 Fix Code Withheld`,e.appendChild(u),!p){let a=document.createElement("div");a.className="mm-tutor-withheld-box",a.innerHTML=`
      <div class="withheld-title">🛡️ Code Fix Withheld (Confidence &lt; 70%)</div>
      <div class="withheld-desc">
        ${null!=(d=t.confidence_reason)?d:"The exact root cause cannot be verified with ≥70% confidence. Automatic code generation is disabled to prevent recommending incorrect code. Follow the diagnostic steps below or ask the AI Assistant."}
      </div>
      <button type="button" class="mm-tutor-ask-ai-btn">
        <span>🤖</span>
        <span>Ask AI Assistant for Full Diagnosis</span>
        <span>→</span>
      </button>
    `;let n=a.querySelector(".mm-tutor-ask-ai-btn");null==n||n.addEventListener("click",()=>{R(),window.dispatchEvent(new CustomEvent("modelmind:open-ai-assistant",{detail:{mode:"explain",error:M}}))}),e.appendChild(a)}if(t.smart_hints&&t.smart_hints.length>0&&t.smart_hints.forEach(t=>{let a=document.createElement("div");a.className="mm-tutor-hint",a.textContent=t,e.appendChild(a)}),t.what){let a=document.createElement("div");a.className="mm-tutor-section",a.innerHTML=`
      <div class="mm-tutor-section-label">What Happened</div>
      <div class="mm-tutor-section-content">${t.what}</div>
    `,e.appendChild(a)}if(t.why){let a=document.createElement("div");a.className="mm-tutor-section",a.innerHTML=`
      <div class="mm-tutor-section-label">Why This Happened</div>
      <div class="mm-tutor-section-content">${t.why}</div>
    `,e.appendChild(a)}if(t.steps&&t.steps.length>0){let a=document.createElement("div");a.className="mm-tutor-section",a.innerHTML=`<div class="mm-tutor-section-label">${p?`How To Fix It (${N.toUpperCase()})`:"Diagnostic Steps"}</div>`,t.steps.forEach((e,t)=>{let n=document.createElement("div");n.className="mm-tutor-step",n.innerHTML=`<div class="mm-tutor-step-num">${t+1}</div><div>${e}</div>`,a.appendChild(n)}),e.appendChild(a)}if(p&&t.code_tip){let a=document.createElement("div");a.className="mm-tutor-section",a.innerHTML=`<div class="mm-tutor-section-label">Recommended Code Fix (${N.toUpperCase()})</div>`;let n=document.createElement("div");n.className="mm-tutor-code-wrap";let i=document.createElement("div");i.className="mm-tutor-code-tip",i.textContent=t.code_tip;let r=document.createElement("button");r.type="button",r.className="mm-tutor-copy-btn",r.textContent="Copy Code",r.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(t.code_tip),r.textContent="Copied!"}catch(e){r.textContent="Copied!"}setTimeout(()=>{r.textContent="Copy Code"},1800)}),n.append(i,r),a.appendChild(n),e.appendChild(a)}if(t.note){let a=document.createElement("div");a.style.fontSize="11px",a.style.color="#94a3b8",a.style.padding="4px 2px",a.textContent=t.note,e.appendChild(a)}}(n,r),a=null==(i=document.getElementById("mm-tutor-fab"))?void 0:i.querySelector(".badge"),null==a||a.classList.add("show")}catch(e){if(!L)return;if(n){n.replaceChildren();let t=document.createElement("div");t.className="mm-tutor-empty",t.innerHTML=`<div style="font-size:24px;margin-bottom:8px">⚠️</div><div style="color:#ef4444">${e instanceof Error?e.message:"Tutor unavailable."}</div>`,n.appendChild(t)}}}let O=[{id:"pca",name:"PCA",category:"Dimensionality reduction",patterns:[/\bPCA\s*\(/],process:["Center numeric features when configured","Find principal directions from fitted data","Project rows into the selected component space"],limits:["Explained variance, component loadings, and projected rows require a fitted PCA estimator."]},{id:"kmeans",name:"K-Means",category:"Clustering",patterns:[/\bKMeans\s*\(/],process:["Initialize cluster centers","Assign each row to a nearest center","Update centers and repeat until stopping"],limits:["Centers, assignments, cluster sizes, and inertia require fitting on data."]},{id:"random-forest",name:"Random Forest",category:"Classification",patterns:[/\bRandomForest(?:Classifier|Regressor)\s*\(/],process:["Build trees from bootstrap samples when enabled","Consider feature splits in each tree","Aggregate tree outputs for a prediction"],limits:["Tree structure, feature importance, and predictions require a fitted forest."]},{id:"xgboost",name:"XGBoost",category:"Boosting",patterns:[/\bXGB(?:Classifier|Regressor)\s*\(/],process:["Add a tree to the ensemble","Fit the next tree to the configured objective and residual signal","Combine the trees for a prediction"],limits:["Boosting rounds, split gains, and predictions require a fitted booster."]},{id:"decision-tree",name:"Decision Tree",category:"Classification",patterns:[/\bDecisionTree(?:Classifier|Regressor)\s*\(/],process:["Evaluate candidate feature splits","Follow a learned branch for each row","Return the value or class stored at a leaf"],limits:["Feature tests, thresholds, branches, and leaf values require a fitted tree."]},{id:"perceptron",name:"Perceptron",category:"Classification",patterns:[/\bPerceptron\s*\(/],process:["Compute a weighted linear score","Compare the score with the decision boundary","Update weights during training when configured"],limits:["Learned weights, boundary, and predictions require fitting and inspection."]},{id:"gradient-boosting",name:"Gradient Boosting",category:"Boosting",patterns:[/\b(?:GradientBoosting|HistGradientBoosting)(?:Classifier|Regressor)\s*\(/],process:["Start with an initial prediction","Fit each weak learner to the current loss gradient","Add learners sequentially using the configured learning rate"],limits:["Stage-wise predictions and fitted tree structure require a trained estimator."]},{id:"mlp",name:"Multi-Layer Perceptron",category:"Deep learning",patterns:[/\bMLP(?:Classifier|Regressor)\s*\(/],process:["Pass inputs through configured hidden layers","Apply learned weights and activation functions","Produce the configured output"],limits:["Weights, activations, loss history, and predictions require a fitted network."]},{id:"gradient-descent",name:"Gradient Descent",category:"Optimization",patterns:[/\b(?:SGDRegressor|SGDClassifier)\s*\(/,/\b(?:gradient_descent|gradient descent)\b/i],process:["Compute an objective or loss gradient","Update parameters in the opposite gradient direction","Repeat until the stopping rule is met"],limits:["Parameter trajectories and convergence require executed optimization with recorded values."]},{id:"linear-regression",name:"Linear Regression",category:"Regression",patterns:[/\bLinearRegression\s*\(/],process:["Combine feature values with learned coefficients","Add the intercept when configured","Return a numeric prediction"],limits:["Coefficients, intercept, residuals, and predictions require a fitted estimator and data."]},{id:"multiple-linear-regression",name:"Multiple Linear Regression",category:"Regression",patterns:[/\bLinearRegression\s*\(/,/\bX\s*=\s*[^\n]*\[\s*[^\]]*,[^\]]*\]/],requireAllPatterns:!0,process:["Read multiple feature columns","Combine them with learned coefficients and an intercept","Return a numeric prediction"],limits:["The source alone cannot establish feature meaning, coefficients, or model quality."]},{id:"logistic-regression",name:"Logistic Regression",category:"Classification",patterns:[/\bLogisticRegression\s*\(/],process:["Compute a linear class score","Map scores to class probabilities","Choose classes using the configured decision rule"],limits:["Fitted coefficients, calibrated probabilities, thresholds, and metrics require model evaluation."]},{id:"multiclass-logistic-regression",name:"Multiclass Logistic Regression",category:"Classification",patterns:[/\bLogisticRegression\s*\(/,/\b(?:multi_class|OneVsRestClassifier|OneVsOneClassifier)\b/],requireAllPatterns:!0,process:["Compute class scores","Convert scores into class probabilities or pairwise decisions","Select a class under the configured strategy"],limits:["The realized class strategy and predictions depend on fitted data and library configuration."]},{id:"knn",name:"K-Nearest Neighbors",category:"Classification",patterns:[/\bKNeighbors(?:Classifier|Regressor)\s*\(/],process:["Measure distance from the query row to stored training rows","Select the configured number of neighbors","Vote or average their target values"],limits:["Neighbor identities and predictions require training rows and a query row."]},{id:"svm",name:"Support Vector Machine",category:"Classification",patterns:[/\b(?:SVC|SVR|LinearSVC|LinearSVR)\s*\(/],process:["Represent the decision function using support vectors","Choose a margin and kernel behavior from configuration","Classify or estimate a value from the fitted decision function"],limits:["Support vectors, margins, and predictions require a fitted estimator."]},{id:"naive-bayes",name:"Naive Bayes",category:"Classification",patterns:[/\b(?:GaussianNB|MultinomialNB|BernoulliNB|CategoricalNB|ComplementNB)\s*\(/],process:["Estimate class prior probabilities","Estimate per-feature likelihoods under the selected variant","Combine likelihoods to score candidate classes"],limits:["Learned priors, likelihoods, and predictions require fitting on labeled data."]},{id:"catboost",name:"CatBoost",category:"Boosting",patterns:[/\bCatBoost(?:Classifier|Regressor)\s*\(/],process:["Build gradient-boosted trees","Apply CatBoost handling for configured categorical features","Combine stages for a prediction"],limits:["The fitted trees, categorical statistics, and predictions are not available from a declaration."]},{id:"lightgbm",name:"LightGBM",category:"Boosting",patterns:[/\bLGBM(?:Classifier|Regressor)\s*\(/],process:["Grow gradient-boosted trees with configured leaf-wise controls","Optimize each stage for the selected loss","Combine stages for a prediction"],limits:["Fitted leaf structure, feature importance, and predictions require training data."]},{id:"regularization",name:"Regularization",category:"Model fitting",patterns:[/\b(?:Ridge|Lasso|ElasticNet)\s*\(/,/\balpha\s*=/],requireAllPatterns:!0,process:["Add a penalty to the fitted objective","Trade fit against coefficient size or complexity","Estimate parameters under the configured penalty"],limits:["The source does not establish whether regularization improves generalization on unseen data."]},{id:"polynomial-regression",name:"Polynomial Regression",category:"Regression",patterns:[/\bPolynomialFeatures\s*\(/],process:["Expand input features into polynomial terms","Fit a regression estimator to the expanded matrix","Evaluate predictions in the original target scale"],limits:["The realized feature expansion and curve depend on degree, input columns, and fitted coefficients."]},{id:"adaboost",name:"AdaBoost",category:"Boosting",patterns:[/\bAdaBoost(?:Classifier|Regressor)\s*\(/],process:["Fit a weak learner","Increase emphasis on errors according to the configured algorithm","Combine learners using learned weights"],limits:["Sample weights, learner sequence, and predictions require a fitted ensemble."]},{id:"voting-stacking",name:"Voting and Stacking",category:"Ensemble",patterns:[/\b(?:VotingClassifier|VotingRegressor|StackingClassifier|StackingRegressor)\s*\(/],process:["Fit the configured base estimators","Combine their outputs or train a meta-estimator","Return the combined prediction"],limits:["Base-estimator outputs and the fitted meta-model require trained estimators."]},{id:"ensemble-lab",name:"Ensemble Lab",category:"Ensemble",patterns:[],process:["Select compatible base estimators","Compare bagging, boosting, or voting strategies","Evaluate each strategy on a consistent validation split"],limits:["An interactive comparison requires explicit model runs on a selected dataset."]},{id:"bagging",name:"Bagging Lab",category:"Ensemble",patterns:[/\b(?:BaggingClassifier|BaggingRegressor)\s*\(/],process:["Draw bootstrap samples when enabled","Fit base estimators independently","Aggregate their predictions"],limits:["Bootstrap samples, estimator diversity, and variance changes require fitted models and data."]},{id:"boosting",name:"Boosting",category:"Boosting",patterns:[/\b(?:AdaBoost|GradientBoosting|HistGradientBoosting|XGB|LGBM|CatBoost)/],process:["Fit a sequence of weak learners","Update later stages from the configured objective","Combine stages for a prediction"],limits:["The source declaration does not show fitted stages, training trajectory, or generalization."]}],D=[["C01","Control-flow graph","Static branch structure; conditions are not evaluated."],["C02","Step-through execution trace","Available after the user clicks Run & trace."],["C03","Variables and memory state","Simple captured values are shown only after Run & trace."],["C04","Call stack","Function frames require a captured execution trace."],["C05","Recursion tree","Recursive calls require a captured execution trace."],["C06","Loop animator","Executed loop iterations require a captured execution trace."],["C07","Array and vector transforms","Shapes and values require executed source or explicit data inspection."],["C08","Linked-list pointers","Requires recognized linked-node data and runtime values."],["C09","Stack and queue","Requires recognized operations and runtime values."],["C10","Sorting animation","Requires executed input and output values."],["C11","Binary-search walkthrough","Requires a sorted input and a query value."],["C12","Time and space complexity","Static explanation only; no runtime benchmark is inferred."],["D01","Error-location highlight","Available when traceback source lines are supplied."],["D02","Traceback flow","Available when a traceback is supplied."],["D03","Variable state delta","Requires captured values before and after a step."],["D04","Expected versus actual output","Requires an expected value and captured output."],["D05","Shape mismatch","Requires observed array or dataframe shapes."],["D06","Overfit and underfit view","Requires train and validation trajectories or scores."],["D07","Residual and prediction plot","Requires target values and model predictions."],["D08","Fix diff and checks","Uses the existing validated-fix workflow when a proposed patch is available."],["P01","Dataset preview and distributions","Available through the existing dataset profiler."],["P02","Missing and outlier map","Available through the existing dataset and preprocessing profilers."],["P03","Preprocessing comparison","Available when before and after previews are generated."],["P04","Pipeline and ColumnTransformer","Static branch and stage view is available from selected source."]];function H(e,t){let a=e.split(/\r?\n/).findIndex(e=>t.test(e));return a<0?void 0:a+1}function B(e,t){var a;let n=t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),i=e.match(RegExp(`\\b${n}\\s*=\\s*(\\([^)]*\\)|[^,\\n)]+)`));return null==(a=null==i?void 0:i[1])?void 0:a.trim()}async function U(e,t){return f("api/ai/chat",e,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)})}function V(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/`([^`]+)`/g,'<code class="mm-chat-inline-code">$1</code>').replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g,"$1<em>$2</em>")}function W(e){let t=document.createElement("div");t.className="mm-chat-msg-content";let{segments:a}=function(e){let t,a=[],n=/```(\w*)\n?([\s\S]*?)```/g,i=0;for(;null!==(t=n.exec(e));)t.index>i&&a.push({type:"text",content:e.slice(i,t.index)}),a.push({type:"code",lang:t[1]||"python",content:t[2].trim()}),i=t.index+t[0].length;return i<e.length&&a.push({type:"text",content:e.slice(i)}),{segments:a}}(e);return a.forEach(e=>{if("code"===e.type){let a=document.createElement("div");a.className="mm-chat-code-block";let n=document.createElement("div");n.className="mm-chat-code-lang";let i=document.createElement("span");i.textContent=e.lang||"code";let r=document.createElement("button");r.className="mm-chat-copy-btn",r.textContent="Copy",r.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(e.content),r.textContent="✓ Copied",setTimeout(()=>{r.textContent="Copy"},1500)}catch(e){r.textContent="Failed"}}),n.append(i,r);let s=document.createElement("pre"),o=document.createElement("code");o.textContent=e.content,s.appendChild(o),a.append(n,s),t.appendChild(a)}else!function(e,t){let a=t.replace(/\r/g,"").split("\n"),n=[],i=()=>{if(!n.length)return;let t=document.createElement("p");t.className="mm-chat-text-seg",t.innerHTML=n.map(V).join("<br>"),e.appendChild(t),n=[]};for(let t=0;t<a.length;){let r=a[t],s=r.match(/^\s{0,3}(#{1,3})\s+(.+?)\s*#*\s*$/);if(s){i();let a=document.createElement(1===s[1].length?"h2":"h3");a.className="mm-chat-heading",a.innerHTML=V(s[2]),e.appendChild(a),t++;continue}let o=r.match(/^\s*[-*+]\s+(.+)$/),l=r.match(/^\s*\d+[.)]\s+(.+)$/);if(o||l){i();let n=document.createElement(l?"ol":"ul");for(n.className="mm-chat-list";t<a.length;){let e=a[t].match(l?/^\s*\d+[.)]\s+(.+)$/:/^\s*[-*+]\s+(.+)$/);if(!e)break;let i=document.createElement("li");i.innerHTML=V(e[1]),n.appendChild(i),t++}e.appendChild(n);continue}if(!r.trim()){i(),t++;continue}n.push(r),t++}i()}(t,e.content)}),t}async function G(e,t,a){var n;let i=e.querySelector(".mm-chat-bubble");if(!(i instanceof HTMLElement))return!1;let r=Array.from(t);if(!r.length)return!0;let s=Math.min(220,Math.max(30,Math.ceil(r.length/10))),o=Math.max(1,Math.ceil(r.length/s)),l=Math.min(8e3,Math.max(900,2.5*r.length))/Math.ceil(r.length/o);i.classList.remove("mm-chat-bubble-streaming");for(let t=0;t<r.length;t+=o){if(!e.isConnected)return!1;let s=r.slice(0,t+o).join(""),d=W((null!=(n=s.match(/```/g))?n:[]).length%2==1?`${s}
\`\`\``:s),c=document.createElement("span");c.className="mm-chat-stream-cursor",c.setAttribute("aria-hidden","true"),i.replaceChildren(d,c),a.scrollTop=a.scrollHeight,await new Promise(e=>window.setTimeout(e,l))}return e.isConnected}function X(e,t,a,n,i,r){var s,o,l;let d,c,m,p,u,f=document.createElement("div");f.className=`mm-chat-msg mm-chat-msg-${e.role}`;let h=document.createElement("div");h.className=`mm-chat-avatar mm-chat-avatar-${e.role}`,h.textContent="user"===e.role?"\uD83D\uDC64":"gemini"===e.provider?"✨":"\uD83E\uDD99";let g=document.createElement("div");g.className="mm-chat-bubble-container";let b=document.createElement("div");b.className=`mm-chat-bubble-header mm-chat-bubble-header-${e.role}`;let x=document.createElement("span");if(x.className="mm-chat-sender-name",x.textContent="user"===e.role?"You":"ModelMind AI",b.appendChild(x),"assistant"===e.role&&e.provider){let t=document.createElement("span");t.className=`mm-chat-provider-badge mm-chat-badge-${e.provider}`,t.textContent="gemini"===e.provider?"Gemini Cloud":"Ollama Local",b.appendChild(t)}let _=document.createElement("span");_.className="mm-chat-time",_.textContent=e.timestamp.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),b.appendChild(_);let v=document.createElement("div");if(v.className=`mm-chat-bubble mm-chat-bubble-${e.role}`,e.isError&&v.classList.add("mm-chat-bubble-error"),e.isStreaming){v.classList.add("mm-chat-bubble-streaming");let e=document.createElement("div");e.className="mm-chat-typing-dots",e.innerHTML="<span></span><span></span><span></span>",v.appendChild(e)}else{let n,i,s,d,c,m,p,u=W(e.content);v.appendChild(u),e.datasetProfile&&v.appendChild((o=e.datasetProfile,(n=document.createElement("section")).style.cssText="margin-top:12px;padding:12px;border:1px solid #dbe3ef;border-radius:10px;background:#fff;color:#243247;font-size:12px",(i=document.createElement("strong")).textContent=`${o.filename} \xb7 ${o.rows.toLocaleString()} rows \xd7 ${o.totalColumns} columns`,n.appendChild(i),(s=document.createElement("div")).style.cssText="margin:5px 0 10px;color:#607086",s.textContent=`${o.duplicateRows} duplicate rows in profiled rows \xb7 statistics use ${o.profiledRows.toLocaleString()} of ${o.rows.toLocaleString()} rows and ${o.columns.length} of ${o.totalColumns} columns`,n.appendChild(s),o.columns.forEach(e=>{let t=document.createElement("div");t.style.cssText="padding:8px 0;border-top:1px solid #edf1f6";let a=document.createElement("div");if(a.style.cssText="font-weight:700;margin-bottom:3px",a.textContent=`${e.name} \xb7 ${e.type} \xb7 ${e.missing} missing \xb7 ${e.unique} unique`,t.appendChild(a),"numeric"===e.type&&e.histogram){let a=document.createElement("div");a.style.color="#607086",a.textContent=`mean ${e.mean} \xb7 median ${e.median} \xb7 SD ${e.std} \xb7 skewness ${e.skewness} \xb7 range ${e.min}–${e.max} \xb7 IQR outliers ${e.outliers}`,t.appendChild(a);let n=Math.max(1,...e.histogram),i=document.createElement("div");i.setAttribute("role","img"),i.setAttribute("aria-label",`Histogram of ${e.name}`),i.style.cssText="height:68px;display:flex;align-items:flex-end;gap:3px;margin-top:8px;padding:0 2px",e.histogram.forEach((e,t)=>{let a=document.createElement("div");a.title=`Bin ${t+1}: ${e} rows`,a.style.cssText=`flex:1;height:${Math.max(3,Math.round(58*e/n))}px;background:#7367f0;border-radius:3px 3px 0 0`,i.appendChild(a)}),t.appendChild(i);let r=document.createElement("div");r.style.cssText="display:flex;justify-content:space-between;color:#607086;font-size:10px",r.append(document.createTextNode(String(e.min)),document.createTextNode(String(e.max))),t.appendChild(r)}else if(e.categories){let a=document.createElement("div");a.style.cssText="display:grid;gap:4px;margin-top:7px";let n=Math.max(1,...e.categories.map(e=>e.count));e.categories.slice(0,8).forEach(({label:e,count:t})=>{let i=document.createElement("div");i.style.cssText="display:grid;grid-template-columns:minmax(50px,1fr) 3fr auto;gap:6px;align-items:center";let r=document.createElement("span");r.textContent=e.slice(0,30),r.title=e;let s=document.createElement("span");s.style.cssText="height:7px;background:#eef0fa;border-radius:8px;overflow:hidden";let o=document.createElement("span");o.style.cssText=`display:block;height:100%;width:${Math.round(100*t/n)}%;background:#20a88a`,s.appendChild(o);let l=document.createElement("span");l.textContent=String(t),i.append(r,s,l),a.appendChild(i)}),t.appendChild(a)}n.appendChild(t)}),n)),e.codeProfile&&v.appendChild((l=e.codeProfile,(d=document.createElement("section")).style.cssText="margin-top:10px;padding:10px 12px;border:1px solid #dbe3ef;border-radius:9px;background:#fff;color:#243247;font-size:11px",(c=document.createElement("strong")).textContent="Code structure map",d.appendChild(c),(m=document.createElement("div")).style.cssText="color:#607086;margin:3px 0 8px",m.textContent="Counts of common Python constructs in the active cell (a quick overview, not an execution trace).",d.appendChild(m),p=Math.max(1,...l.map(e=>e.count)),l.forEach(({label:e,count:t})=>{let a=document.createElement("div");a.style.cssText="display:grid;grid-template-columns:86px 1fr 22px;gap:6px;align-items:center;margin:4px 0";let n=document.createElement("span");n.textContent=e;let i=document.createElement("span");i.style.cssText="height:8px;background:#eef0fa;border-radius:8px;overflow:hidden";let r=document.createElement("span");r.style.cssText=`display:block;height:100%;width:${Math.round(100*t/p)}%;background:#7367f0`,i.appendChild(r);let s=document.createElement("span");s.textContent=String(t),a.append(n,i,s),d.appendChild(a)}),d)),e.animationCode&&t&&a&&v.appendChild(function(e,t,a,n){let i,r,s=e,o=s.replace(/\r\n?/g,"\n").split("\n").slice(0,250),l=document.createElement("section");l.setAttribute("aria-label","Python execution trace"),l.style.cssText="margin-top:10px;padding:10px;border:1px solid #dbe3ef;border-radius:9px;background:#fff;color:#243247;font-size:12px";let d=document.createElement("strong");d.textContent="▶ Python execution trace";let c=document.createElement("div");c.style.cssText="font-size:11px;color:#607086;margin:4px 0 8px",c.textContent=n?"Run & trace reads the currently selected notebook cell each time, then replays its executed lines and variable values.":"Runs the uploaded code in the current kernel, then replays its executed lines and variable values.";let m=document.createElement("div");m.style.cssText="display:flex;align-items:center;gap:6px;margin-bottom:8px";let p=(e,t)=>{let a=document.createElement("button");return a.type="button",a.textContent=e,a.title=t,a.style.cssText="border:1px solid #dbe3ef;border-radius:6px;background:#f8fafc;padding:4px 8px;color:#243247;cursor:pointer",a},u=p("▶ Run & trace","Run this code cell and capture its execution path");u.style.background="#eef2ff",u.style.borderColor="#c7d2fe",u.style.color="#4338ca";let f=p("← Back","Previous executed line"),h=p("▶ Play","Play execution trace"),g=p("Next →","Next executed line"),b=document.createElement("span");b.style.cssText="margin-left:auto;font-size:11px;color:#607086",m.append(u,f,h,g,b);let x=document.createElement("div");x.style.cssText="max-height:260px;overflow:auto;border:1px solid #edf1f6;border-radius:6px;background:#0f172a;padding:6px 0;font:11px/1.55 ui-monospace,SFMono-Regular,Menlo,monospace";let _=[],v=()=>{_=(o=s.replace(/\r\n?/g,"\n").split("\n").slice(0,250)).map((e,t)=>{let a=document.createElement("div");a.dataset.line=String(t),a.style.cssText="display:grid;grid-template-columns:36px minmax(0,1fr);padding:0 8px;color:#cbd5e1;white-space:pre;min-height:17px";let n=document.createElement("span");n.textContent=String(t+1),n.style.color="#64748b";let i=document.createElement("span");return i.textContent=e||" ",a.append(n,i),a}),x.replaceChildren(..._)};v();let y=document.createElement("div");y.setAttribute("aria-live","polite"),y.style.cssText="font-size:11px;color:#475569;margin-top:7px;min-height:16px",y.textContent="Run & trace captures the real path; loops can visit a line multiple times and untaken branches are skipped.";let w=document.createElement("div");w.style.cssText="display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:5px;margin-top:8px";let C=document.createElement("div");C.style.cssText="display:flex;flex-wrap:wrap;align-items:center;gap:5px;margin-top:7px;font-size:10px;color:#475569";let k=document.createElement("section");k.style.cssText="display:none;margin-top:8px;padding:8px 9px;border:1px solid #e2e8f0;border-radius:7px;background:#f8fafc";let E=document.createElement("section");E.style.cssText="display:none;margin-top:8px;padding:8px 9px;border:1px solid #e2e8f0;border-radius:7px;background:#f8fafc";let $=document.createElement("section");$.style.cssText="display:none;margin-top:8px;padding:8px 9px;border:1px solid #ddd6fe;border-radius:7px;background:#faf9ff";let T=document.createElement("div");T.style.cssText="font-size:10px;line-height:1.5;color:#475569;margin-top:6px";let S=document.createElement("pre");S.style.cssText="display:none;max-height:120px;overflow:auto;white-space:pre-wrap;background:#f8fafc;border:1px solid #edf1f6;border-radius:6px;padding:7px;font:11px/1.4 ui-monospace,monospace;color:#334155";let N=[],M=0,A=e=>{if(!e||!/^\[\s*-?\d/.test(e)||!/^\[.*\]$/.test(e))return null;let t=e.slice(1,-1).split(",").map(e=>e.trim());if(t.length<2||t.length>16||t.some(e=>!/^-?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(e)))return null;let a=t.map(Number);return a.every(Number.isFinite)?a:null},L=()=>{var e,t;let a;if(_.forEach(e=>{let t=Number(e.dataset.line)+1;e.style.background=t===i?"rgba(239,68,68,.24)":"transparent"}),0===N.length){b.textContent=i?`Error at line ${i}`:"Run to capture execution";return}let n=N[M],r=N.slice(0,M+1).filter(e=>e.line===n.line).length;_.forEach(e=>{let t=Number(e.dataset.line)+1,a=t===n.line;e.style.background=a?"rgba(109,124,255,.28)":t===i?"rgba(239,68,68,.24)":"transparent",a&&e.scrollIntoView({block:"nearest"})}),b.textContent=`Executed step ${M+1} of ${N.length} \xb7 line ${n.line} \xb7 visited ${r}\xd7${"<module>"!==n.functionName?` \xb7 ${n.functionName}()`:""}`,y.textContent=`At the start of this line: ${!(a=(null!=(e=o[n.line-1])?e:"").trim())?"Blank line — visual spacing only.":a.startsWith("#")?"Comment — Python skips this line when executing the cell.":/^(from\s+\S+\s+import|import)\b/.test(a)?"Import — makes a module or selected names available to later lines.":/^(for|while)\b/.test(a)?"Loop header — the indented body runs for each item or while its condition is true.":/^(if|elif|else|try|except|finally|with)\b/.test(a)?"Control-flow line — which indented block runs depends on the runtime condition or outcome.":/^(def|class|async\s+def)\b/.test(a)?"Definition — creates a function or class; its body runs later when called or instantiated.":/^return\b/.test(a)?"Return — exits the current function and passes a value back to its caller.":/^(print|display)\s*\(/.test(a)?"Output — sends a value to the notebook output when this line runs.":/^[\w.\[\]]+\s*([+\-*/]?=)/.test(a)?"Assignment or update — evaluates the expression and stores its result in a name or location.":"Statement — Python evaluates this line in order; its exact effect depends on the current values and program state."}`,w.replaceChildren();let l=Object.entries(n.variables);if(0===l.length){let e=document.createElement("span");e.textContent="No simple variable values at this step.",e.style.cssText="color:#64748b;font-size:11px",w.appendChild(e)}else l.forEach(([e,t])=>{let a=document.createElement("div");a.style.cssText="padding:5px 7px;border:1px solid #e2e8f0;border-radius:6px;background:#f8fafc;min-width:0";let n=document.createElement("strong");n.textContent=e,n.style.cssText="display:block;color:#475569;font-size:10px";let i=document.createElement("span");i.textContent=t,i.title=t,i.style.cssText="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:11px ui-monospace,monospace;color:#0f172a",a.append(n,i),w.appendChild(a)});C.replaceChildren();let d=document.createElement("strong");d.textContent="Call stack:",C.appendChild(d),((null==(t=n.callStack)?void 0:t.length)?n.callStack:[n.functionName]).forEach((e,t)=>{if(t){let e=document.createElement("span");e.textContent="›",C.appendChild(e)}let a=document.createElement("span");a.textContent="<module>"===e?"cell":`${e}()`,a.style.cssText="padding:3px 6px;border:1px solid #e2e8f0;border-radius:999px;background:#f8fafc",C.appendChild(a)});let c=M>0?N[M-1].variables:{},m=Object.entries(n.variables).filter(([e,t])=>c[e]!==t).map(([e,t])=>`${e}: ${void 0===c[e]?"created":`${c[e]} →`} ${t}`),p=Object.keys(c).filter(e=>!(e in n.variables)).map(e=>`${e}: no longer captured`);T.textContent=`Variable changes since previous captured step: ${[...m,...p].join(" \xb7 ")||"none among the simple values captured"}`,(()=>{var e;let t=N[M],a=Object.entries(null!=(e=null==t?void 0:t.variables)?e:{}).map(([e,t])=>({name:e,values:A(t)})).filter(e=>null!==e.values);if(E.replaceChildren(),!a.length){E.style.display="none";return}E.style.display="block";let n=/\bsorted\s*\(|\.sort\s*\(/.test(s),i=document.createElement("strong");i.textContent=n?"Sorting / array state at this trace step":"Captured small numeric arrays",i.style.cssText="display:block;color:#34405a;font-size:10px;margin-bottom:4px";let r=document.createElement("div");r.textContent="Values are captured from the explicitly executed trace; move through steps to compare snapshots.",r.style.cssText="color:#64748b;font-size:9px;margin-bottom:6px",E.append(i,r);let o=M>0?N[M-1].variables:{};a.forEach(({name:e,values:t})=>{let a=document.createElement("div");a.style.cssText="margin-top:6px;padding:6px;border:1px solid #e2e8f0;border-radius:6px;background:#fff";let n=document.createElement("div");n.textContent=e,n.style.cssText="font:10px ui-monospace,monospace;color:#475569;margin-bottom:3px";let i=A(o[e]),r=document.createElementNS("http://www.w3.org/2000/svg","svg");r.setAttribute("viewBox","0 0 360 86"),r.setAttribute("width","100%"),r.setAttribute("height","86"),r.setAttribute("role","img"),r.setAttribute("aria-label",`${e} values captured at trace step ${M+1}`);let s=Math.min(0,...t),l=Math.max(0,...t),d=l-s||1,c=8+l/d*58,m=340/t.length,p=document.createElementNS(r.namespaceURI,"line");p.setAttribute("x1","10"),p.setAttribute("x2","350"),p.setAttribute("y1",String(c)),p.setAttribute("y2",String(c)),p.setAttribute("stroke","#94a3b8"),r.appendChild(p),t.forEach((e,a)=>{let n=8+(l-e)/d*58,s=document.createElementNS(r.namespaceURI,"rect");s.setAttribute("x",String(10+a*m+2)),s.setAttribute("y",String(Math.min(c,n))),s.setAttribute("width",String(Math.max(3,m-4))),s.setAttribute("height",String(Math.max(2,Math.abs(c-n))));let o=i&&(i.length!==t.length||i[a]!==e);s.setAttribute("fill",o?"#f59e0b":"#7567e8"),s.setAttribute("rx","2");let p=document.createElementNS(r.namespaceURI,"text");p.setAttribute("x",String(10+a*m+m/2)),p.setAttribute("y","82"),p.setAttribute("text-anchor","middle"),p.setAttribute("font-size",String(Math.min(9,.55*m))),p.setAttribute("fill","#475569"),p.textContent=String(e),r.append(s,p)}),a.append(n,r),E.appendChild(a)})})(),(()=>{if($.replaceChildren(),!N.length){$.style.display="none";return}let e=function(e,t,a){let n=e.replace(/\r\n?/g,"\n").split("\n"),i=t[a];if(!i)return null;let r=e=>{var t,a;return null!=(a=null==(t=e.match(/^[ \t]*/))?void 0:t[0].replace(/\t/g,"    ").length)?a:0},s=[];n.forEach((e,t)=>{if(!/^\s*(?:for|while)\b/.test(e)||e.replace(/^\s+/,"").startsWith("#"))return;let a=r(e),o=n.length;for(let e=t+1;e<n.length;e+=1)if(n[e].trim()&&r(n[e])<=a){o=e;break}i.line>=t+1&&i.line<o+1&&s.push({index:t,end:o})});let o=s.sort((e,t)=>t.index-e.index)[0];if(!o)return null;let l=o.index+1,d=n[o.index].trim().replace(/:\s*(?:#.*)?$/,""),c=t.reduce((e,t,a)=>(t.line===l&&e.push({eventIndex:a,visitNumber:e.length+1}),e),[]),m=n[o.index].match(/^\s*for\s+([A-Za-z_]\w*)\s+in\b/);return{line:l,header:d,visits:c,capturedVariables:m&&void 0!==i.variables[m[1]]?[`${m[1]} = ${i.variables[m[1]]}`]:[]}}(s,N,M);if(!e){$.style.display="none";return}$.style.display="block";let t=document.createElement("strong");t.textContent="Observed loop trace",t.style.cssText="display:block;color:#4338ca;font-size:10px;margin-bottom:3px";let a=document.createElement("code");a.textContent=e.header,a.style.cssText="display:block;overflow-wrap:anywhere;color:#334155;font:10px ui-monospace,monospace;margin-bottom:4px";let n=document.createElement("div");if(n.textContent=`Captured ${e.visits.length} trace visit(s) at this loop header. These are observed line events; the panel does not infer condition outcomes or claim an iteration total.`,n.style.cssText="color:#64748b;font-size:9px;line-height:1.4;margin-bottom:6px",$.append(t,a,n),e.capturedVariables.length){let t=document.createElement("div");t.textContent=`Captured loop variable: ${e.capturedVariables.join(", ")}`,t.style.cssText="color:#475569;font:9px ui-monospace,monospace;margin-bottom:6px",$.appendChild(t)}let i=document.createElement("div");i.style.cssText="display:flex;flex-wrap:wrap;gap:4px",e.visits.forEach(({eventIndex:e,visitNumber:t})=>{let a=document.createElement("button");a.type="button",a.textContent=`Visit ${t}`,a.title=`Jump to captured trace step ${e+1}`,a.setAttribute("aria-label",`Jump to loop header visit ${t}, trace step ${e+1}`),a.style.cssText=`padding:3px 6px;border:1px solid ${e===M?"#7567e8":"#ddd6fe"};border-radius:999px;background:${e===M?"#ede9fe":"#fff"};color:#5145cd;font-size:9px;cursor:pointer`,a.addEventListener("click",()=>{z(),M=e,L()}),i.appendChild(a)}),$.appendChild(i)})()},z=()=>{r&&clearInterval(r),r=void 0,h.textContent="▶ Play",h.title="Play execution trace"};if(f.addEventListener("click",()=>{z(),M=Math.max(M-1,0),L()}),g.addEventListener("click",()=>{z(),M=Math.min(M+1,N.length-1),L()}),h.addEventListener("click",()=>{r?z():N.length<2||M>=N.length-1||(h.textContent="⏸ Pause",h.title="Pause walkthrough",r=setInterval(()=>{!l.isConnected||M>=N.length-1?z():(M+=1,L())},650))}),u.addEventListener("click",async()=>{let e=n?a().trim():s;if(!e){y.textContent="Select a code cell in the notebook, then run the trace again.";return}if(e!==s&&(s=e,N=[],i=void 0,M=0,v(),w.replaceChildren(),C.replaceChildren(),k.replaceChildren(),k.style.display="none",E.replaceChildren(),E.style.display="none",$.replaceChildren(),$.style.display="none",T.textContent="",S.style.display="none",b.textContent="Selected cell changed \xb7 tracing the new code"),/\b(?:input|getpass)\s*\(/.test(e)){y.textContent="This cell uses input(). Interactive prompts are not supported in trace mode yet; try a cell that does not ask for keyboard input.";return}if(window.confirm("Run the currently selected code cell in its Jupyter kernel to capture the real execution path? It can change variables, show output, and repeat any file or network actions in the code.")){u.disabled=!0,u.textContent="Tracing…",y.textContent="Running the selected code and capturing executed lines…";try{let a=await t(e);N=a.events.slice(0,1e3),i=a.errorLine,M=0,(()=>{let e={name:"Notebook cell",children:new Map},t=!1;if(N.forEach(a=>{var n;let i=(null!=(n=a.callStack)?n:[a.functionName]).filter(e=>"<module>"!==e);if(!i.length)return;t=!0;let r=e;i.forEach(e=>{let t=r.children.get(e);t||(t={name:e,children:new Map},r.children.set(e,t)),r=t})}),k.replaceChildren(),!t){k.style.display="none";return}k.style.display="block";let a=document.createElement("strong");a.textContent="Observed call / recursion tree",a.style.cssText="display:block;color:#34405a;font-size:10px;margin-bottom:4px";let n=document.createElement("div");n.textContent="Unique stack paths seen during this run. Repeated names indicate observed recursion depth; this is not a count of total function calls.",n.style.cssText="color:#64748b;font-size:9px;line-height:1.4;margin-bottom:5px";let i=(e,t)=>{let a=document.createElement("ol");return a.style.cssText="margin:2px 0 2px 14px;padding-left:12px;color:#475569;font-size:10px",e.children.forEach(e=>{let n=document.createElement("li"),r=t.indexOf(e.name)>=0,s=document.createElement("span");s.textContent=`${"<module>"===e.name?"cell":`${e.name}()`}${r?" \xb7 recursive frame":""}`,s.style.cssText=r?"color:#7c3aed;font-weight:700":"color:#475569",n.appendChild(s),e.children.size&&n.appendChild(i(e,[...t,e.name])),a.appendChild(n)}),a};k.append(a,n,i(e,[]))})(),S.style.display=a.output||a.error?"block":"none",S.textContent=[a.output,a.error?`Execution stopped: ${a.error}`:""].filter(Boolean).join("\n"),y.textContent=a.error?`Captured ${N.length} executed steps before the cell stopped with an error${i?` at selected-cell line ${i}`:""}. The exact source line is highlighted.`:`Captured ${N.length} executed steps. Repeated lines show loops; lines Python skipped do not appear.`,0===N.length&&(y.textContent+=" No Python line events were captured."),L()}catch(e){y.textContent=e instanceof Error?e.message:"Could not capture this execution."}finally{u.disabled=!1,u.textContent="↻ Run again"}}}),l.append(d,c,m,x,y,C,k,w,T,$,E,S),b.textContent="Run to capture execution",o.length>=250){let e=document.createElement("div");e.style.cssText="font-size:10px;color:#607086;margin-top:5px",e.textContent="Showing the first 250 lines.",l.appendChild(e)}return l}(e.animationCode,t,a,!1!==e.animationUsesActiveCell)),e.decisionTrees&&v.appendChild(function(e){let t=document.createElement("section");if(t.style.cssText="margin-top:10px;padding:12px;border:1px solid #dbe3ef;border-radius:10px;background:#fff;color:#243247",!e.length)return t.textContent="No fitted scikit-learn decision tree was found in the current notebook kernel. Fit a DecisionTreeClassifier or DecisionTreeRegressor, then try again.",t;let a=document.createElement("strong");a.textContent="\uD83C\uDF33 Fitted decision tree";let n=document.createElement("div");n.style.cssText="display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:8px 0";let i=document.createElement("select");i.setAttribute("aria-label","Choose fitted decision tree"),i.style.cssText="max-width:220px;padding:5px;border:1px solid #cbd5e1;border-radius:6px;background:#fff;color:#243247",e.forEach((e,t)=>{let a=document.createElement("option");a.value=String(t),a.textContent=`${e.modelName} \xb7 ${e.task}`,i.appendChild(a)});let r=document.createElement("label");r.style.cssText="display:flex;align-items:center;gap:6px;font-size:11px;color:#475569";let s=document.createElement("span"),o=document.createElement("input");o.type="range",o.min="1",o.max="10",o.value="3",o.setAttribute("aria-label","Maximum tree depth shown");let l=document.createElement("div");l.style.cssText="max-height:440px;overflow:auto;border:1px solid #edf1f6;border-radius:8px;background:#f8fafc";let d=document.createElement("div");d.style.cssText="font-size:10px;color:#64748b;margin-top:6px",r.append(document.createTextNode("Visible depth "),o,s),n.append(i,r);let c=()=>{var t;let a=null!=(t=e[Number(i.value)])?t:e[0],n=Math.max(1,Math.min(10,a.maxDepth));o.max=String(n),o.value=String(Math.max(1,Math.min(Number(o.value),n)));let r=Math.min(Number(o.value),a.maxDepth);s.textContent=`${r} / ${a.maxDepth}`;let c=a.nodes.filter(e=>e.depth<=r),m=[];c.forEach(e=>{var t,a;return(null!=(t=m[a=e.depth])?t:m[a]=[]).push(e)});let p=Math.max(680,210*Math.max(1,...m.map(e=>{var t;return null!=(t=null==e?void 0:e.length)?t:0}))+26),u=Math.max(150,(r+1)*118+42),f=new Map;m.forEach((e,t)=>null==e?void 0:e.forEach((a,n)=>{let i=(n+1)*p/(e.length+1);f.set(a.id,{x:i,y:21+118*t})}));let h=document.createElementNS("http://www.w3.org/2000/svg","svg");h.setAttribute("viewBox",`0 0 ${p} ${u}`),h.setAttribute("width",String(p)),h.setAttribute("height",String(u)),h.setAttribute("role","img"),h.setAttribute("aria-label",`${a.task} tree with ${a.nodeCount} nodes`),c.forEach(e=>{let t=f.get(e.id);t&&[["left","≤"],["right",">"]].forEach(([a,n])=>{let i=e[a],r=null===i?void 0:f.get(i);if(!r)return;let s=document.createElementNS(h.namespaceURI,"line");s.setAttribute("x1",String(t.x)),s.setAttribute("y1",String(t.y+76)),s.setAttribute("x2",String(r.x)),s.setAttribute("y2",String(r.y)),s.setAttribute("stroke","#94a3b8"),s.setAttribute("stroke-width","2"),h.appendChild(s);let o=document.createElementNS(h.namespaceURI,"text");o.setAttribute("x",String((t.x+r.x)/2)),o.setAttribute("y",String((t.y+76+r.y)/2)),o.setAttribute("text-anchor","middle"),o.setAttribute("font-size","11"),o.setAttribute("fill","#475569"),o.textContent=n,h.appendChild(o)})}),c.forEach(e=>{let t=f.get(e.id);if(!t)return;let n=null===e.left&&null===e.right,i=document.createElementNS(h.namespaceURI,"g"),r=document.createElementNS(h.namespaceURI,"rect");r.setAttribute("x",String(t.x-92)),r.setAttribute("y",String(t.y)),r.setAttribute("width",String(184)),r.setAttribute("height",String(76)),r.setAttribute("rx","9"),r.setAttribute("fill",n?"#ecfdf5":"#eef2ff"),r.setAttribute("stroke",n?"#86efac":"#a5b4fc"),r.setAttribute("stroke-width","1.5"),i.appendChild(r);let s=document.createElementNS(h.namespaceURI,"title");s.textContent=n?`Leaf: ${e.prediction}`:`${e.feature} ≤ ${e.threshold}`,i.appendChild(s);let o=(e,a,n=!1)=>{let r=document.createElementNS(h.namespaceURI,"text");r.setAttribute("x",String(t.x)),r.setAttribute("y",String(t.y+a)),r.setAttribute("text-anchor","middle"),r.setAttribute("font-size",n?"12":"10"),r.setAttribute("font-weight",n?"700":"400"),r.setAttribute("fill","#1e293b"),r.textContent=e,i.appendChild(r)},l=n?`Predict: ${e.prediction}`:`${e.feature} ≤ ${e.threshold}`;o(l.length>27?`${l.slice(0,24)}…`:l,23,!0),o(`samples ${e.samples} \xb7 ${"classification"===a.task?"gini":"impurity"} ${e.impurity.toPrecision(3)}`,43),o(`node ${e.id}`,62),h.appendChild(i)}),l.replaceChildren(h),window.requestAnimationFrame(()=>{l.isConnected&&(l.scrollLeft=Math.max(0,p/2-l.clientWidth/2))}),d.textContent=`${a.criterion} \xb7 ${a.nodeCount} nodes \xb7 maximum depth ${a.maxDepth}. Showing depth ${r}${a.maxDepth>10?" (visualization capped at depth 10)":""}; scroll horizontally to inspect branches.`};return i.addEventListener("change",c),o.addEventListener("input",c),t.append(a,n,l,d),c(),t}(e.decisionTrees)),e.neuralNetworks&&v.appendChild(function(e){let t=document.createElement("section");if(t.style.cssText="margin-top:10px;padding:12px;border:1px solid #dbe3ef;border-radius:10px;background:#fff;color:#243247",!e.length)return t.textContent="No fitted scikit-learn MLP neural network was found in the current notebook kernel. Fit an MLPClassifier or MLPRegressor, then try again.",t;let a=document.createElement("strong");a.textContent="\uD83E\uDDE0 Fitted neural network";let n=document.createElement("div");n.style.cssText="display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:8px 0";let i=document.createElement("select");i.setAttribute("aria-label","Choose fitted neural network"),i.style.cssText="max-width:240px;padding:5px;border:1px solid #cbd5e1;border-radius:6px;background:#fff;color:#243247",e.forEach((e,t)=>{let a=document.createElement("option");a.value=String(t),a.textContent=`${e.modelName} \xb7 ${e.task}`,i.appendChild(a)});let r=document.createElement("button");r.type="button",r.textContent="▶ Play",r.setAttribute("aria-label","Play neural network flow animation"),r.style.cssText="padding:5px 10px;border:1px solid #cbd5e1;border-radius:6px;background:#fff;color:#243247;cursor:pointer;font-weight:600";let s=document.createElement("select");s.setAttribute("aria-label","Neural network animation speed"),s.style.cssText="padding:5px;border:1px solid #cbd5e1;border-radius:6px;background:#fff;color:#243247",[1,2,3,4].forEach(e=>{let t=document.createElement("option");t.value=String(e),t.textContent=`${e}\xd7`,s.appendChild(t)});let o=document.createElement("label");o.style.cssText="display:flex;align-items:center;gap:6px;font-size:11px;color:#475569",o.append(document.createTextNode("Hide weak weights "));let l=document.createElement("input");l.type="range",l.min="0",l.max="100",l.value="0",l.setAttribute("aria-label","Hide weak neural network weights");let d=document.createElement("span");o.append(l,d),n.append(i,r,s,o);let c=document.createElement("div");c.style.cssText="font-size:11px;line-height:1.6;color:#475569;margin:6px 0";let m=document.createElement("div");m.style.cssText="max-height:470px;overflow:auto;border:1px solid #edf1f6;border-radius:8px;background:#f8fafc";let p=document.createElement("div");p.style.cssText="font-size:10px;color:#64748b;margin-top:6px";let u=document.createElement("div");u.style.cssText="font-size:10px;color:#64748b;min-height:14px;margin:3px 0",t.append(a,n,c,u,m,p);let f=null,h=!1,g=-1,b=[],x=[],_=()=>{var t,a,n,r,s;b.forEach(e=>{let t=e.layer===g;e.element.setAttribute("stroke",t?"#f59e0b":e.stroke),e.element.setAttribute("stroke-width",t?"3.5":e.width),e.element.setAttribute("stroke-opacity",t?"0.95":e.opacity)}),x.forEach(e=>{let t=e.layer===g||e.layer===g+1;e.element.setAttribute("fill",t?"#fef3c7":e.fill),e.element.setAttribute("stroke",t?"#f59e0b":e.stroke)});let o=null!=(t=e[Number(i.value)])?t:e[0];u.textContent=g>=0?`${h?"Playing":"Paused"} \xb7 ${null!=(n=null==(a=o.layers[g])?void 0:a.label)?n:"Layer"} → ${null!=(s=null==(r=o.layers[g+1])?void 0:r.label)?s:"Output"} \xb7 illustrative, not a specific prediction`:"Ready \xb7 animation highlights the layer-by-layer flow; it does not calculate a sample prediction."},v=(e=!0)=>{null!==f&&window.clearInterval(f),f=null,h=!1,r.textContent="▶ Play",r.setAttribute("aria-label","Play neural network flow animation"),e&&(g=-1),_()},y=()=>{var t;let a=Math.max(1,(null!=(t=e[Number(i.value)])?t:e[0]).layers.length-1);g=(g+1)%a,_()},w=()=>{null!==f&&window.clearInterval(f),h=!0,r.textContent="⏸ Pause",r.setAttribute("aria-label","Pause neural network flow animation"),y();let e=1200/Number(s.value);f=window.setInterval(()=>{t.isConnected?y():v()},e)};r.addEventListener("click",()=>h?v(!1):w()),s.addEventListener("change",()=>{h&&w()}),i.addEventListener("change",()=>{v(),C()});let C=()=>{var t;let a=null!=(t=e[Number(i.value)])?t:e[0],n=Math.max(0,...a.connections.map(e=>Math.abs(e.weight))),r=n*Number(l.value)/100,s=a.connections.filter(e=>Math.abs(e.weight)>=r),o=Math.max(720,100+(a.layers.length-1)*132),u=new Map;b=[],x=[],a.layers.forEach((e,t)=>{let a=Math.max(1,e.nodes.length);e.nodes.forEach((e,n)=>{u.set(`${t}:${e.index}`,{x:48+132*t,y:70+(n+1)*300/(a+1)})})});let f=document.createElementNS("http://www.w3.org/2000/svg","svg");f.setAttribute("viewBox",`0 0 ${o} 430`),f.setAttribute("width",String(o)),f.setAttribute("height",String(430)),f.setAttribute("role","img"),f.setAttribute("aria-label",`${a.modelType} neural network with layer sizes ${a.layers.map(e=>e.size).join(", ")}`),s.forEach(e=>{var t,a,i;let r=u.get(`${e.fromLayer}:${e.fromNode}`),s=u.get(`${e.fromLayer+1}:${e.toNode}`);if(!r||!s)return;let o=document.createElementNS("http://www.w3.org/2000/svg","line");o.setAttribute("x1",String(r.x)),o.setAttribute("y1",String(r.y)),o.setAttribute("x2",String(s.x)),o.setAttribute("y2",String(s.y)),o.setAttribute("stroke",e.weight>=0?"#2563eb":"#dc2626"),o.setAttribute("stroke-width",String(.7+1.8*Math.abs(e.weight)/(n||1))),o.setAttribute("stroke-opacity",String(.12+.65*Math.abs(e.weight)/(n||1))),b.push({element:o,layer:e.fromLayer,stroke:null!=(t=o.getAttribute("stroke"))?t:"#2563eb",width:null!=(a=o.getAttribute("stroke-width"))?a:"1",opacity:null!=(i=o.getAttribute("stroke-opacity"))?i:"0.5"});let l=document.createElementNS(f.namespaceURI,"title");l.textContent=`Weight ${e.weight.toFixed(4)}`,o.appendChild(l),f.appendChild(o)}),a.layers.forEach((e,t)=>{let n=document.createElementNS(f.namespaceURI,"text");n.setAttribute("x",String(48+132*t)),n.setAttribute("y","24"),n.setAttribute("text-anchor","middle"),n.setAttribute("font-size","12"),n.setAttribute("font-weight","700"),n.setAttribute("fill","#334155"),n.textContent=e.label,f.appendChild(n);let i=document.createElementNS(f.namespaceURI,"text");i.setAttribute("x",String(48+132*t)),i.setAttribute("y","42"),i.setAttribute("text-anchor","middle"),i.setAttribute("font-size","10"),i.setAttribute("fill","#64748b"),i.textContent=`${e.size} units`,e.nodes.length<e.size&&(i.textContent+=` \xb7 showing ${e.nodes.length}`),f.appendChild(i),e.nodes.forEach(e=>{var n,i;let r=u.get(`${t}:${e.index}`);if(!r)return;let s=document.createElementNS("http://www.w3.org/2000/svg","circle");s.setAttribute("cx",String(r.x)),s.setAttribute("cy",String(r.y)),s.setAttribute("r","13"),s.setAttribute("fill",0===t?"#dbeafe":t===a.layers.length-1?"#dcfce7":"#ede9fe"),s.setAttribute("stroke",0===t?"#3b82f6":t===a.layers.length-1?"#22c55e":"#8b5cf6"),s.setAttribute("stroke-width","2"),x.push({element:s,layer:t,fill:null!=(n=s.getAttribute("fill"))?n:"#ede9fe",stroke:null!=(i=s.getAttribute("stroke"))?i:"#8b5cf6"});let o=document.createElementNS(f.namespaceURI,"title");o.textContent=e.label,s.appendChild(o),f.appendChild(s);let l=document.createElementNS(f.namespaceURI,"text");l.setAttribute("x",String(r.x)),l.setAttribute("y",String(r.y+27)),l.setAttribute("text-anchor","middle"),l.setAttribute("font-size","9"),l.setAttribute("fill","#475569"),l.textContent=e.label.length>15?`${e.label.slice(0,13)}…`:e.label,f.appendChild(l)})}),m.replaceChildren(f),d.textContent=`${Number(l.value)}% \xb7 ${s.length}/${a.connections.length} links`,c.textContent=`${a.modelType} \xb7 ${a.task} \xb7 layers ${a.layers.map(e=>e.size).join(" → ")} \xb7 hidden activation ${a.activation} \xb7 output ${a.outputActivation} \xb7 loss ${a.loss} \xb7 ${a.epochs} training iterations`,p.textContent=`Blue links have positive weights; red links have negative weights. Line thickness shows absolute weight. Gold highlights the current animation step. Hover a link or neuron for its value. ${a.classes.length?`Classes: ${a.classes.join(", ")}.`:""} Showing a representative subset of neurons when a layer exceeds 12 units.`,_()};return l.addEventListener("input",C),C(),t}(e.neuralNetworks)),e.trainingSources&&v.appendChild(function(e,t){let a=document.createElement("section");a.style.cssText="margin-top:10px;padding:12px;border:1px solid #dbe3ef;border-radius:10px;background:#fff;color:#243247";let n=document.createElement("strong");n.textContent="\uD83C\uDFCB Train a model in this notebook";let i=document.createElement("div");if(i.style.cssText="font-size:11px;color:#64748b;margin:5px 0 9px",i.textContent="Training runs in the active local Python kernel. Use numeric or already encoded features.",a.append(n,i),!e.length){let e=document.createElement("div");return e.style.cssText="padding:10px;border-radius:7px;background:#f8fafc;color:#475569;font-size:12px",e.textContent="I could not find a usable feature/target pair. Define X_train and y_train (optionally X_test and y_test), or X and y, then try again.",a.appendChild(e),a}let r=document.createElement("div");r.style.cssText="display:flex;flex-wrap:wrap;align-items:center;gap:7px";let s=document.createElement("select");s.setAttribute("aria-label","Training data source"),s.style.cssText="max-width:260px;padding:6px;border:1px solid #cbd5e1;border-radius:6px;background:#fff;color:#243247",e.forEach((e,t)=>{let a=document.createElement("option");a.value=e.id,a.textContent=`${e.featuresName} + ${e.targetName} \xb7 ${e.rows} rows \xb7 ${e.featureCount} features`,0===t&&(a.selected=!0),s.appendChild(a)});let o=document.createElement("select");o.setAttribute("aria-label","Model type to train"),o.style.cssText="padding:6px;border:1px solid #cbd5e1;border-radius:6px;background:#fff;color:#243247",[["decision_tree","Decision Tree"],["random_forest","Random Forest"],["neural_network","Neural Network (MLP)"]].forEach(([e,t])=>{let a=document.createElement("option");a.value=e,a.textContent=t,o.appendChild(a)});let l=document.createElement("button");l.type="button",l.textContent="▶ Train locally",l.style.cssText="padding:6px 10px;border:1px solid #c7d2fe;border-radius:6px;background:#eef2ff;color:#3730a3;cursor:pointer;font-weight:600",r.append(s,o,l);let d=document.createElement("div");return d.style.cssText="font-size:11px;color:#475569;margin-top:8px",d.textContent="Task type is detected from the target. A holdout split is used when a test set is not already available.",a.append(r,d),l.addEventListener("click",async()=>{if(t){l.disabled=!0,l.textContent="⏳ Training…",d.textContent="Training and evaluating the model in the notebook kernel…";try{let e=await t(s.value,o.value),a=e.secondaryMetrics.map(e=>`${e.label}: ${e.value.toFixed(4)}`).join(" \xb7 ");d.textContent=`${e.modelType} ${e.task} trained locally as ${e.modelName}. ${e.primaryMetric}: ${e.primaryScore.toFixed(4)}${a?` \xb7 ${a}`:""} \xb7 ${e.trainRows} train / ${e.testRows} test rows \xb7 ${e.featureCount} features. Use Visualize Tree or Visualize Neural Network to inspect supported fitted models.`,d.style.color="#166534"}catch(e){d.textContent=e instanceof Error?e.message:"Training failed in the notebook kernel.",d.style.color="#b91c1c"}finally{l.disabled=!1,l.textContent="▶ Train locally"}}}),a}(e.trainingSources,r))}return e.codeVisualization&&v.appendChild(function(e){var t,a;let n=document.createElement("section");n.setAttribute("aria-label","Source-derived code visualization"),n.style.cssText="margin-top:10px;padding:13px;border:1px solid #d9d5ff;border-radius:12px;background:linear-gradient(145deg,#fbfaff,#f5f7ff);color:#25304a;box-shadow:0 5px 18px rgba(79,70,180,.08)";let i=document.createElement("div");i.style.cssText="display:flex;justify-content:space-between;align-items:flex-start;gap:8px";let r=document.createElement("strong");r.textContent=`🔎 ${e.title}`,r.style.cssText="font-size:13px;color:#24234b";let s=document.createElement("span");s.textContent="SOURCE-BASED \xb7 NOT RUN",s.style.cssText="flex:none;padding:4px 7px;border-radius:999px;background:#ecebff;color:#5548c8;font-size:9px;font-weight:800;letter-spacing:.04em",i.append(r,s);let o=document.createElement("p");if(o.textContent=e.summary,o.style.cssText="margin:7px 0 11px;color:#59657b;font-size:11px;line-height:1.55",n.append(i,o),e.category){let t=document.createElement("span");t.textContent=e.category,t.style.cssText="display:inline-block;margin:-3px 0 9px;padding:3px 7px;border-radius:999px;background:#eeeaff;color:#5b4fd0;font-size:9px;font-weight:700",n.appendChild(t)}if(null==(t=e.sourceOverlays)||t.forEach(e=>{let t=document.createElement("section");t.style.cssText="margin:7px 0;padding:9px 10px;border:1px solid #e2e5f2;border-radius:9px;background:rgba(255,255,255,.8)";let a=document.createElement("div");a.style.cssText="display:flex;justify-content:space-between;align-items:center;gap:8px";let i=document.createElement("strong");i.textContent=`${e.id} \xb7 ${e.title}`,i.style.cssText="font-size:11px;color:#343657";let r=document.createElement("span");r.textContent="SOURCE CUE",r.style.cssText="flex:none;padding:3px 6px;border-radius:999px;background:#f0efff;color:#5b4fd0;font-size:8px;font-weight:800;letter-spacing:.04em",a.append(i,r);let s=document.createElement("p");s.textContent=e.summary,s.style.cssText="margin:5px 0 7px;color:#68738a;font-size:10px;line-height:1.45";let o=document.createElement("ol");o.style.cssText="list-style:none;padding:0;margin:0;display:grid;gap:4px",e.steps.forEach((e,t)=>{var a;let n=document.createElement("li");n.style.cssText=`display:grid;grid-template-columns:22px minmax(0,1fr) auto;gap:7px;align-items:start;padding:6px 7px;margin-left:${(null!=(a=e.indent)?a:0)*12}px;border:1px solid #eceef7;border-radius:7px;background:#fff`;let i=document.createElement("span");i.textContent=String(t+1),i.style.cssText="display:grid;place-items:center;width:19px;height:19px;border-radius:50%;background:#eeedff;color:#5548c8;font-size:9px;font-weight:800";let r=document.createElement("span"),s=document.createElement("strong");s.textContent=e.title,s.style.cssText="display:block;color:#343657;font-size:10px";let l=document.createElement("span");if(l.textContent=e.detail,l.style.cssText="display:block;margin-top:2px;color:#68738a;font-size:9px;line-height:1.4;overflow-wrap:anywhere",r.append(s,l),n.append(i,r),void 0!==e.line){let t=document.createElement("span");t.textContent=`L${e.line}`,t.style.cssText="padding:3px 5px;border-radius:5px;background:#f2f3f9;color:#737990;font-size:8px;white-space:nowrap",n.appendChild(t)}o.appendChild(n)}),t.append(a,s,o),n.appendChild(t)}),"neural-network"===e.kind&&(null==(a=e.layers)?void 0:a.length)){let t=document.createElement("div");t.style.cssText="overflow-x:auto;border:1px solid #e5e7f7;border-radius:9px;background:#fff;padding:7px;margin-bottom:9px";let a=Math.max(500,84+(e.layers.length-1)*145),i=document.createElementNS("http://www.w3.org/2000/svg","svg");i.setAttribute("viewBox",`0 0 ${a} 205`),i.setAttribute("width",String(a)),i.setAttribute("height",String(205)),i.setAttribute("role","img"),i.setAttribute("aria-label","Source-derived neural network layer architecture");let r=[];e.layers.forEach((e,t)=>{let a=null===e.units?3:Math.min(5,Math.max(1,e.units)),n=48+145*t,i=Array.from({length:a},(e,t)=>({x:n,y:64+(t+1)*105/(a+1)}));r.push(i)}),r.slice(0,-1).forEach((e,t)=>{e.forEach(e=>r[t+1].forEach(t=>{let a=document.createElementNS(i.namespaceURI,"line");a.setAttribute("x1",String(e.x+8)),a.setAttribute("y1",String(e.y)),a.setAttribute("x2",String(t.x-8)),a.setAttribute("y2",String(t.y)),a.setAttribute("stroke","#c4c6e7"),a.setAttribute("stroke-width","1.2"),i.appendChild(a)}))}),e.layers.forEach((e,t)=>{let a=48+145*t,n=document.createElementNS(i.namespaceURI,"text");n.setAttribute("x",String(a)),n.setAttribute("y","18"),n.setAttribute("text-anchor","middle"),n.setAttribute("font-size","10"),n.setAttribute("font-weight","700"),n.setAttribute("fill","#4b4d76"),n.textContent=e.label,i.appendChild(n),r[t].forEach(e=>{let a=document.createElementNS(i.namespaceURI,"circle");a.setAttribute("cx",String(e.x)),a.setAttribute("cy",String(e.y)),a.setAttribute("r","7"),a.setAttribute("fill",["#7c6cf1","#22a879","#f3a53b"][t%3]),a.setAttribute("stroke","#fff"),a.setAttribute("stroke-width","2"),i.appendChild(a)});let s=document.createElementNS(i.namespaceURI,"text");s.setAttribute("x",String(a)),s.setAttribute("y","190"),s.setAttribute("text-anchor","middle"),s.setAttribute("font-size","10"),s.setAttribute("fill","#68738a"),s.textContent=null===e.units?"width unknown":`${e.units} unit${1===e.units?"":"s"}`,i.appendChild(s)});let s=document.createElement("div");s.textContent="Layer-to-layer connections are schematic; no learned weights or sample activations are displayed.",s.style.cssText="font-size:10px;color:#68738a;margin:0 3px 3px",t.append(i,s),n.appendChild(t)}else if("decision-tree"===e.kind){let e=document.createElement("div");e.style.cssText="overflow-x:auto;border:1px solid #e5e7f7;border-radius:9px;background:#fff;padding:7px;margin-bottom:9px";let t=document.createElementNS("http://www.w3.org/2000/svg","svg");t.setAttribute("viewBox","0 0 560 190"),t.setAttribute("width","560"),t.setAttribute("height","190"),t.setAttribute("role","img"),t.setAttribute("aria-label","Conceptual decision-tree branches, not a fitted tree");let a=(e,a,n,i)=>{let r=document.createElementNS(t.namespaceURI,"line");r.setAttribute("x1",String(e)),r.setAttribute("y1",String(a)),r.setAttribute("x2",String(n)),r.setAttribute("y2",String(i)),r.setAttribute("stroke","#a5a8ca"),r.setAttribute("stroke-width","2"),t.appendChild(r)};a(280,64,145,112),a(280,64,415,112);let i=(e,a,n,i,r)=>{let s=document.createElementNS(t.namespaceURI,"g"),o=document.createElementNS(t.namespaceURI,"rect");o.setAttribute("x",String(e-88)),o.setAttribute("y",String(a-23)),o.setAttribute("width","176"),o.setAttribute("height","48"),o.setAttribute("rx","10"),o.setAttribute("fill",r),o.setAttribute("stroke","#d6d8ec"),s.appendChild(o),[[n,a-2,"11","700"],[i,a+14,"9","400"]].forEach(([a,n,i,r])=>{let o=document.createElementNS(t.namespaceURI,"text");o.setAttribute("x",String(e)),o.setAttribute("y",String(n)),o.setAttribute("text-anchor","middle"),o.setAttribute("font-size",String(i)),o.setAttribute("font-weight",String(r)),o.setAttribute("fill","#34405a"),o.textContent=String(a),s.appendChild(o)}),t.appendChild(s)};i(280,45,"Feature test","learned from fit data","#f2efff"),i(145,135,"True branch","continues to a leaf","#effaf5"),i(415,135,"False branch","continues to a leaf","#fff7e9");let r=document.createElementNS(t.namespaceURI,"text");r.setAttribute("x","198"),r.setAttribute("y","91"),r.setAttribute("font-size","9"),r.setAttribute("fill","#626b81"),r.textContent="yes",t.appendChild(r);let s=document.createElementNS(t.namespaceURI,"text");s.setAttribute("x","355"),s.setAttribute("y","91"),s.setAttribute("font-size","9"),s.setAttribute("fill","#626b81"),s.textContent="no",t.appendChild(s),e.appendChild(t),n.appendChild(e)}let l=document.createElement("ol");l.style.cssText="list-style:none;padding:0;margin:0;display:grid;gap:6px",e.steps.forEach((e,t)=>{let a=document.createElement("li");a.style.cssText="display:grid;grid-template-columns:24px minmax(0,1fr) auto;gap:8px;align-items:start;padding:7px 8px;border:1px solid #e7e8f4;border-radius:8px;background:#fff";let n=document.createElement("span");n.textContent=String(t+1),n.style.cssText="display:grid;place-items:center;width:21px;height:21px;border-radius:50%;background:#eeedff;color:#5548c8;font-size:10px;font-weight:800";let i=document.createElement("span"),r=document.createElement("strong");r.textContent=e.title,r.style.cssText="display:block;color:#343657;font-size:11px";let s=document.createElement("span");if(s.textContent=e.detail,s.style.cssText="display:block;margin-top:2px;color:#68738a;font-size:10px;line-height:1.45",i.append(r,s),a.append(n,i),void 0!==e.line){let t=document.createElement("span");t.textContent=`Line ${e.line}`,t.style.cssText="padding:3px 5px;border-radius:5px;background:#f2f3f9;color:#737990;font-size:9px;white-space:nowrap",a.appendChild(t)}l.appendChild(a)}),n.appendChild(l);let d=(e,t,a)=>{if(!t.length)return;let i=document.createElement("div");i.style.cssText="margin-top:8px;padding:9px 10px;border:1px solid #e5e7f3;border-radius:9px;background:#fff";let r=document.createElement("strong");r.textContent=e,r.style.cssText=`display:block;margin-bottom:5px;color:${a};font-size:10px`;let s=document.createElement("ul");s.style.cssText="margin:0;padding-left:17px;color:#59657b;font-size:10px;line-height:1.5",t.slice(0,6).forEach(e=>{let t=document.createElement("li");t.textContent=e,s.appendChild(t)}),i.append(r,s),n.appendChild(i)};d("What we can read from this source",e.sourceFacts,"#26764b"),d("What this preview cannot establish",e.limits,"#8a5b19");let c=document.createElement("p");return c.textContent=`Grounding: ${e.sourceNote}`,c.style.cssText="margin:9px 1px 0;padding-top:8px;border-top:1px solid #e6e7f3;color:#68738a;font-size:10px;line-height:1.5",n.appendChild(c),n}(e.codeVisualization)),(null==(s=e.visualizationIds)?void 0:s.length)&&v.appendChild((d=[...new Set(e.visualizationIds)].map(e=>{var t;let a;return{id:e,label:(a=O.find(t=>t.id===e))?a.name:null==(t=D.find(([t])=>t===e))?void 0:t[1]}}).filter(e=>!!e.label).slice(0,5),(c=document.createElement("section")).setAttribute("aria-label","Related visualization catalog suggestions"),c.style.cssText="margin-top:8px;padding:9px 11px;border:1px solid #e3defe;border-radius:9px;background:#fbfaff",(m=document.createElement("strong")).textContent="Related visualization topics",m.style.cssText="display:block;color:#343657;font-size:10px;margin-bottom:5px",(p=document.createElement("div")).textContent="AI suggestions checked against the ModelMind catalog; these labels do not claim runtime results or create another visualization.",p.style.cssText="color:#68738a;font-size:9px;line-height:1.4;margin-bottom:6px",(u=document.createElement("div")).style.cssText="display:flex;flex-wrap:wrap;gap:5px",d.forEach(({id:e,label:t})=>{let a=document.createElement("span");a.textContent=`${t} \xb7 ${e}`,a.style.cssText="padding:4px 7px;border:1px solid #e3defe;border-radius:999px;background:#fff;color:#5145cd;font-size:9px",u.appendChild(a)}),c.append(m,p,u),c)),g.append(b,v),"user"===e.role?f.append(g,h):f.append(h,g),f}let J="practice-question",K="practice-answer";function Q(e){return e.replace(/\r/g,"").trim()}function Y(){if("u"<typeof document||document.getElementById("mm-error-highlight-styles"))return;let e=document.createElement("style");e.id="mm-error-highlight-styles",e.textContent=`
    /* ── Code Line Error Highlight ── */
    .mm-code-error-line {
      background: rgba(239, 68, 68, 0.16) !important;
      border-left: 3px solid #ef4444 !important;
      padding-left: 4px !important;
      border-radius: 2px !important;
      box-shadow: inset 0 0 0 1px rgba(239, 68, 68, 0.22) !important;
    }
    .mm-code-error-line,
    .mm-code-error-line span {
      color: #ef4444 !important;
    }

    body[data-jp-theme-light="false"] .mm-code-error-line,
    body.jp-theme-dark .mm-code-error-line {
      background: rgba(239, 68, 68, 0.22) !important;
      box-shadow: inset 0 0 0 1px rgba(239, 68, 68, 0.35) !important;
    }
    body[data-jp-theme-light="false"] .mm-code-error-line,
    body[data-jp-theme-light="false"] .mm-code-error-line span,
    body.jp-theme-dark .mm-code-error-line,
    body.jp-theme-dark .mm-code-error-line span {
      color: #f87171 !important;
    }

    /* ── Gutter Error Marker ── */
    .mm-code-error-gutter {
      color: #ef4444 !important;
      font-weight: 750 !important;
      background: rgba(239, 68, 68, 0.14) !important;
      position: relative !important;
      border-radius: 2px 0 0 2px !important;
    }
    .mm-code-error-gutter::before {
      content: "⊗ ";
      color: #ef4444;
      font-weight: 900;
      font-size: 11px;
      display: inline-block;
      margin-right: 2px;
    }

    /* ── Below-Editor Diagnostic Card ── */
    .mm-cell-error-row {
      margin: 6px 0 8px 0 !important;
      width: 100% !important;
      display: flex !important;
      flex-direction: row !important;
      overflow: visible !important;
    }

    .mm-cell-error-card {
      margin: 0 !important;
      padding: 10px 14px;
      border-radius: 6px;
      background: #fff5f5;
      border: 1px solid #fca5a5;
      border-left: 4px solid #ef4444 !important;
      box-shadow: 0 1px 4px rgba(239, 68, 68, 0.08);
      display: flex;
      align-items: flex-start;
      gap: 12px;
      width: 100% !important;
      box-sizing: border-box !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      animation: mm-error-slide-in 0.18s ease-out;
      position: relative;
      z-index: 2;
    }

    @keyframes mm-error-slide-in {
      from { opacity: 0; transform: translateY(-3px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .mm-cell-error-card .mm-card-icon {
      flex-shrink: 0;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: rgba(239, 68, 68, 0.12);
      border: 1.5px solid #ef4444;
      color: #ef4444;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 900;
      margin-top: 1px;
    }

    .mm-cell-error-card .mm-card-body {
      flex: 1;
      min-width: 0;
    }

    .mm-cell-error-card .mm-card-title {
      font-size: 13px;
      font-weight: 750;
      color: #991b1b;
      margin-bottom: 3px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .mm-cell-error-card .mm-card-desc {
      font-size: 12px;
      font-weight: 500;
      color: #1f2937;
      margin-bottom: 3px;
      line-height: 1.45;
    }

    .mm-cell-error-card .mm-card-tip {
      font-size: 11.5px;
      color: #64748b;
      line-height: 1.4;
    }

    .mm-cell-error-card .mm-card-dismiss {
      background: transparent;
      border: none;
      color: #9ca3af;
      font-size: 14px;
      line-height: 1;
      cursor: pointer;
      padding: 2px 4px;
      border-radius: 4px;
      transition: color 0.15s ease;
    }
    .mm-cell-error-card .mm-card-dismiss:hover {
      color: #ef4444;
    }

    /* ── Dark Theme Overrides ── */
    body[data-jp-theme-light="false"] .mm-cell-error-card,
    body.jp-theme-dark .mm-cell-error-card {
      background: #1c1917 !important;
      border: 1px solid rgba(239, 68, 68, 0.35) !important;
      border-left: 4px solid #ef4444 !important;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45) !important;
    }
    body[data-jp-theme-light="false"] .mm-cell-error-card .mm-card-title,
    body.jp-theme-dark .mm-cell-error-card .mm-card-title {
      color: #ffffff !important;
    }
    body[data-jp-theme-light="false"] .mm-cell-error-card .mm-card-desc,
    body.jp-theme-dark .mm-cell-error-card .mm-card-desc {
      color: #f1f5f9 !important;
    }
    body[data-jp-theme-light="false"] .mm-cell-error-card .mm-card-tip,
    body.jp-theme-dark .mm-cell-error-card .mm-card-tip {
      color: #94a3b8 !important;
    }
  `,document.head.appendChild(e)}let Z=new WeakMap,ee=new WeakMap;function et(e){if(!e||!e.node)return;let t=e.node,a=Z.get(t);a&&(a.disconnect(),Z.delete(t));let n=ee.get(e);n&&(n(),ee.delete(e)),t.querySelectorAll(".mm-code-error-line").forEach(e=>{e.classList.remove("mm-code-error-line")}),t.querySelectorAll(".mm-code-error-gutter").forEach(e=>{e.classList.remove("mm-code-error-gutter")}),t.querySelectorAll(".mm-cell-error-row, .mm-cell-error-card").forEach(e=>{e.remove()})}let ea="@ml-platform/error-assistant:open";function en(e){var t,a,n;let i=null!=(n=null!=(t=e.activeCell)?t:null==(a=e.currentWidget)?void 0:a.content.activeCell)?n:null;if(i&&ei(i))return i;let r=e.currentWidget;if(r){let e=r.content.widgets;for(let t=e.length-1;t>=0;t--){let a=e[t];if(a&&ei(a))return a}}return i}function ei(e){let t;if(!e||!(0,r.isCodeCellModel)(e.model))return null;for(let a of e.model.outputs.toJSON().reverse())if(es(a)){t=a;break}if(!t)return null;let a=e.model.toJSON().source,n=Array.isArray(a)?a.join(""):a;return{cell_id:e.model.id.slice(0,256),code:n.slice(0,2e4),error_type:t.ename.slice(0,200),error_message:t.evalue.slice(0,2e3),traceback:t.traceback.join("\n").slice(0,12e3)}}function er(e,t){let a=e.content.widgets,n=a.indexOf(t);return n<0?"":a.slice(Math.max(0,n-1),n+2).filter(e=>e!==t&&(0,r.isCodeCellModel)(e.model)).map(e=>{let t=e.model.toJSON().source;return Array.isArray(t)?t.join(""):t}).join("\n").slice(0,12e3)}function es(e){return"error"===e.output_type&&"ename"in e&&"string"==typeof e.ename&&"evalue"in e&&"string"==typeof e.evalue&&"traceback"in e&&Array.isArray(e.traceback)&&e.traceback.every(e=>"string"==typeof e)}function eo(e,t){let a=document.createElement("div");return a.className=`ml-assistant-status-pill ml-assistant-status-${t}`,a.textContent=e,a}function el(e,t,a,n=!1){e.replaceChildren();let i=document.createElement("div");i.className="ml-assistant-result-header";let r=document.createElement("div");r.className="ml-assistant-error-banner";let s=document.createElement("span");s.className="ml-assistant-error-icon",s.setAttribute("aria-hidden","true"),s.textContent="!";let o=document.createElement("div");o.className="ml-assistant-error-copy";let l=document.createElement("div");l.className="ml-assistant-error-title",l.textContent=t.errorType;let d=document.createElement("div");d.className="ml-assistant-error-message",d.textContent=t.errorMessage,o.append(l,d),r.append(s,o);let c=document.createElement("div");c.className="ml-assistant-traceback";let m=document.createElement("details"),p=document.createElement("summary");p.textContent="View traceback";let u=document.createElement("pre");u.textContent=t.traceback,m.append(p,u),c.append(m);let f=document.createElement("div");f.className="ml-assistant-card ml-assistant-card-blue";let h=document.createElement("div");h.className="ml-assistant-card-title",h.textContent="Explanation";let g=document.createElement("p");g.textContent=t.summary;let b=document.createElement("ul");t.details.forEach(e=>{let t=document.createElement("li");t.textContent=e,b.appendChild(t)}),f.append(h,g,b);let x=document.createElement("div");x.className="ml-assistant-card ml-assistant-card-green";let _=document.createElement("div");_.className="ml-assistant-card-title",_.textContent="Possible solution";let v=document.createElement("p");v.textContent=t.fix;let y=document.createElement("div");y.className="ml-assistant-code-block",y.textContent="Generate a suggestion to see corrected code here.";let w=null;x.append(_,v,y);let C=document.createElement("div");C.className="ml-assistant-actions";let k=document.createElement("button");k.type="button",k.textContent="Suggest Fix",k.disabled=!a;let E=document.createElement("button");E.type="button",E.textContent="Apply Fix",E.disabled=!a;let $=document.createElement("button");$.type="button",$.textContent="Copy Code",$.className="ml-assistant-secondary-button";let T=async()=>{if(!a)throw Error("No fix action is available");if(w)return w;k.disabled=!0,E.disabled=!0,k.textContent="Generating...";try{return w=await a.suggestFix(),v.textContent="gemini"===w.provider?`Gemini suggestion: ${w.summary}`:w.summary,y.textContent=w.candidate_code,$.disabled=!1,w}finally{k.textContent="Suggest Fix",k.disabled=!1,E.disabled=!1}};k.addEventListener("click",async()=>{k.disabled=!0,k.textContent="Generating...";try{await T()}catch(e){v.textContent=e instanceof Error?e.message:"Could not generate a fix"}finally{k.disabled=!1,k.textContent="Suggest Fix"}}),E.addEventListener("click",async()=>{if(a){E.disabled=!0,k.disabled=!0,E.textContent=w?"Applying...":"Generating...";try{let e=await T();await a.applyFix(e),E.textContent="Fixed and ran"}catch(e){E.textContent=e instanceof Error?e.message:"Could not apply fix"}finally{k.disabled=!1}window.setTimeout(()=>{E.textContent="Apply Fix",E.disabled=!1},2500)}}),$.addEventListener("click",async()=>{if(w){try{await navigator.clipboard.writeText(w.candidate_code),$.textContent="Copied"}catch(e){$.textContent="Copy failed"}window.setTimeout(()=>{$.textContent="Copy Code"},1200)}}),$.disabled=!0,k.classList.add("ml-assistant-action-wide"),C.append(k,E,$),i.append(r,c),e.append(i,f,x,C),n&&a&&k.click()}document.querySelectorAll('link[rel~="icon"]').forEach(e=>{e.remove()}),(n=document.createElement("link")).rel="icon",n.type="image/png",n.setAttribute("sizes","256x256"),n.href=m,document.head.appendChild(n),(i=document.createElement("style")).id="modelmind-splash-branding",i.textContent=`
    #jupyterlab-splash #moon1,
    #jupyterlab-splash #moon2,
    #jupyterlab-splash #moon3 {
      display: none !important;
      animation: none !important;
    }
  `,document.head.appendChild(i);let ed={id:"@ml-platform/error-assistant:plugin",description:"JupyterLab error assistant frontend and server extension",autoStart:!0,requires:[o.IMainMenu,l.INotebookTracker,d.ITranslator,s.IDocumentManager],activate:(e,t,a,n,i)=>{var s,o,d;let m,p,u,b,x,_,v,y,w,C,k,T,S,N,M,L,F,R,D,V,W,ed,ec,em,ep,eu,ef,eh,eg=n.load("@ml-platform/error-assistant"),eb=new c.Widget;eb.id="ml-platform-error-assistant-panel",eb.title.label="Error Assistant",eb.title.caption="Error Assistant — analyze & fix notebook errors",eb.addClass("ml-platform-error-assistant-panel");let ex=[eb],e_=[],ev=[],ey=null,ew=e.shell,eC=!ew.restored,ek=null;if(!document.getElementById("mm-plain-notebook-styles")){let e=document.createElement("style");e.id="mm-plain-notebook-styles",e.textContent=`
        body.mm-plain-modelmind-notebook
          #jp-main-content-panel > .jp-SideArea[data-side="right"] {
          display: none !important;
        }
        body.mm-plain-modelmind-notebook
          .jp-SideBar.jp-mod-left
          .lm-TabBar-tab[data-id="modelmind-studio-sidebar"],
        body.mm-plain-modelmind-notebook #modelmind-studio-sidebar,
        body.mm-plain-modelmind-notebook #mm-tutor-fab,
        body.mm-plain-modelmind-notebook #mm-tutor-panel,
        body.mm-plain-modelmind-notebook #mm-tutor-overlay {
          display: none !important;
        }
      `,document.head.appendChild(e)}let eE=e=>{var t,a;return null!=(a=null==(t=document.querySelector(`.jp-SideBar.jp-mod-${e} .lm-TabBar-tab.lm-mod-current`))?void 0:t.dataset.id)?a:null},e$=null,eT=()=>{var t,n,i,r,s;let o=g(null==(t=a.currentWidget)?void 0:t.context.model),l="plain"===o,d="practice"===o,c=l||d;for(let e of ex)c?e.hide():e.show();for(let e of e_)l?e.hide():e.show();for(let e of ev)d?e.show():e.hide();if(l)!ek&&eC&&(ek={leftCollapsed:null!=(n=ew.leftCollapsed)&&n,rightCollapsed:null!=(i=ew.rightCollapsed)&&i,leftActiveId:eE("left"),rightActiveId:eE("right")}),document.body.classList.add("mm-plain-modelmind-notebook"),document.body.classList.remove("mm-practice-modelmind-notebook"),ew.leftCollapsed||"modelmind-studio-sidebar"!==eE("left")||e.shell.activateById("filebrowser");else if(d)document.body.classList.remove("mm-plain-modelmind-notebook"),document.body.classList.add("mm-practice-modelmind-notebook"),ey&&!ew.leftCollapsed&&e.shell.activateById(ey.id),!ew.rightCollapsed&&e_[0]&&e.shell.activateById(e_[0].id);else if(ek){if(document.body.classList.remove("mm-plain-modelmind-notebook"),document.body.classList.remove("mm-practice-modelmind-notebook"),ek.leftCollapsed)null==(r=ew.collapseLeft)||r.call(ew);else if(ek.leftActiveId){let t=eE("left");(null===t||"modelmind-studio-sidebar"===t)&&e.shell.activateById(ek.leftActiveId)}ek.rightCollapsed?null==(s=ew.collapseRight)||s.call(ew):ek.rightActiveId&&e.shell.activateById(ek.rightActiveId),ek=null}else document.body.classList.remove("mm-plain-modelmind-notebook"),document.body.classList.remove("mm-practice-modelmind-notebook");j(!c)};null==(s=ew.restored)||s.then(()=>{eC=!0,eT(),setTimeout(()=>{let e=document.querySelector("#jp-left-stack");e&&e.offsetWidth<300&&(e.style.width="340px");let t=document.querySelector("#jp-right-stack");t&&t.offsetWidth<300&&(t.style.width="350px")},400)});let eS=eT,eN=()=>eS(),eM=e=>{e$&&e$.metadataChanged.disconnect(eN),(e$=e)&&e$.metadataChanged.connect(eN),eT()};a.currentChanged.connect((e,t)=>{t?t.context.ready.then(()=>{a.currentWidget===t&&eM(t.context.model)}):eM(null)});let eA=document.createElement("div");eA.className="ml-assistant-shell";let eL=document.createElement("div");eL.className="ml-assistant-header";let ez=document.createElement("h2");ez.textContent="AI Assistant";let eP=document.createElement("div");eP.className="ml-assistant-header-controls";let eF=document.createElement("button");eF.type="button",eF.className="ml-assistant-primary-button",eF.textContent="Install Ollama",eF.disabled=!0;let eR=document.createElement("label");eR.className="ml-assistant-cloud-option",eR.title="When enabled, the failed cell, traceback, and nearby code may be sent to Google Gemini, either directly or as a fallback.";let eI=document.createElement("input");eI.type="checkbox",eI.checked=!0,eI.disabled=!1;let ej=document.createElement("span");ej.textContent="Allow Gemini use",eR.append(eI,ej);let eq=document.createElement("div");eq.className="ml-assistant-status-row";let eO=eo("Ollama (Local AI)","success"),eD=eo("Gemini (Cloud)","default"),eH=document.createElement("label");eH.className="ml-assistant-provider-row",eH.textContent="Fix provider";let eB=document.createElement("select");eB.className="ml-assistant-provider-select";let eU=document.createElement("option");eU.value="ollama",eU.textContent="Ollama (local)";let eV=document.createElement("option");eV.value="gemini",eV.textContent="Gemini (cloud)",eB.append(eU,eV),eH.appendChild(eB);let eW=document.createElement("div");eW.className="ml-assistant-tab-row";let eG=new Map;["Explain Error","Suggest Fix","Code Help","Ask AI"].forEach((e,t)=>{let a=document.createElement("button");a.type="button",a.className=`ml-assistant-tab ${0===t?"active":""}`,a.textContent=e,eW.appendChild(a),eG.set(e,a)});let eX=null,eJ=document.createElement("div");eJ.className="ml-assistant-cta-row";let eK=document.createElement("button");eK.type="button",eK.className="ml-assistant-cta-button",eK.textContent="Analyze Error",eJ.appendChild(eK);let eQ=document.createElement("div");eQ.className="ml-assistant-content";let eY="explain",eZ=!1;eQ.appendChild(((x=document.createElement("div")).className="ml-assistant-empty",x.textContent="Select a failed code cell to capture its error.",x)),eL.append(ez,eP),eP.append(eF,eR),eq.append(eO,eD),eA.append(eL,eq,eH,eW,eJ,eQ),eb.node.append(eA);let e0=async()=>{try{let t=await f("api/health",e.serviceManager.serverSettings);eO.textContent="ok"===t.status?"Ollama (Local AI)":"Platform unavailable",eO.className="ok"===t.status?"ml-assistant-status-pill ml-assistant-status-success":"ml-assistant-status-pill ml-assistant-status-warn",eI.disabled=!1,eV.disabled=!1,eD.textContent=t.gemini_fallback_available?"✨ Gemini ready":"enabled"===t.cloud_fallback?"Gemini (Key needed)":"Gemini (Cloud)",eD.className=t.gemini_fallback_available?"ml-assistant-status-pill ml-assistant-status-success":"ml-assistant-status-pill ml-assistant-status-default"}catch(e){eO.textContent="Platform unavailable",eO.className="ml-assistant-status-pill ml-assistant-status-warn",eI.disabled=!1,eD.textContent="Gemini (Cloud)",eD.className="ml-assistant-status-pill ml-assistant-status-warn"}try{let t=await f("api/local-ai/status",e.serviceManager.serverSettings);"connected"===t.status&&"available"===t.model_status?(eZ=!0,eO.textContent="Ollama (Local AI)",eO.className="ml-assistant-status-pill ml-assistant-status-success",eF.textContent="Model ready",eF.disabled=!0):("connected"===t.status?(eZ=!0,eO.textContent="Model missing",eO.className="ml-assistant-status-pill ml-assistant-status-warn",eF.textContent="Install recommended model"):(eZ=!1,eO.textContent="Ollama not detected",eO.className="ml-assistant-status-pill ml-assistant-status-warn",eF.textContent="Get Ollama"),eF.disabled=!1)}catch(e){eZ=!1,eO.textContent="Local AI unavailable",eO.className="ml-assistant-status-pill ml-assistant-status-warn",eF.textContent="Get Ollama",eF.disabled=!1}};eK.addEventListener("click",async()=>{let t=en(a),n=a.currentWidget,i=ei(t);if(!i)return void el(eQ,{errorType:"No error detected",errorMessage:"The active code cell has no error output.",traceback:"No traceback available.",summary:"Select a cell that produced an actual runtime error.",details:["The selected cell is not currently failing."],fix:'print("Select a failing cell and retry.")'});eQ.innerHTML="",eK.disabled=!0;let s=document.createElement("div");s.className="ml-assistant-empty",s.textContent="Capturing error...",eQ.appendChild(s),i&&(eX=i,q({error_type:i.error_type,error_message:i.error_message,traceback:i.traceback,code:i.code},e.serviceManager.serverSettings));try{let a=await f("api/error/analyze",e.serviceManager.serverSettings,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(i)});if("analyzed"!==a.status)throw Error("analysis unavailable");let s=a.analysis.summary,o=a.analysis.details,d=async()=>{if(!t||!n)throw Error("Select a notebook cell first");let a=await f("api/ai/fix",e.serviceManager.serverSettings,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({error:i,notebook_context:er(n,t),provider:eB.value,allow_gemini_fallback:eI.checked})});if("suggested"!==a.status||!a.candidate_code)throw Error(a.message||("gemini_disabled"===a.status?"Gemini fallback is disabled by server policy":"gemini_opt_in_required"===a.status?"Check Allow Gemini use before selecting Gemini":"gemini_unconfigured"===a.status?"Save a Gemini API key in JupyterLab using the API Key tab in the right sidebar":"gemini_unavailable"===a.status?"Gemini is temporarily unavailable; try again later":"model_missing"===a.status?`Install ${a.model_id||"the local Ollama model"} first`:"incomplete_model_response"===a.status||"incomplete_gemini_response"===a.status?"The AI returned only part of the cell. Nothing was applied; try again or enable Gemini fallback.":"Neither local Ollama nor the enabled Gemini fallback produced a valid fix"));return{summary:a.summary||"A fix candidate is ready.",candidate_code:a.candidate_code,provider:a.provider||"ollama"}},c=async e=>{var a,i;let s,o;if(!t||!n)throw Error("Select a notebook cell first");if(a=t.model,i=e.candidate_code,s=null==a?void 0:a.sharedModel,o=i.trim(),!s||"function"!=typeof s.setSource||!o||(s.setSource(o),0))throw Error("Could not update the failed cell");if(!await l.NotebookActions.runCells(n.content,[t],n.sessionContext))throw Error("Fix applied; cell could not be run");if(!(0,r.isCodeCellModel)(t.model)||t.model.outputs.toJSON().some(es))throw Error("Fix applied, but the cell still reports an error")},m={suggestFix:d,applyFix:c};if(a.analysis.is_sufficient)return void el(eQ,{errorType:i.error_type,errorMessage:i.error_message,traceback:i.traceback,summary:s,details:o,fix:"A corrected cell will be generated locally when you apply the fix."},m,"suggest"===eY);let p=await f("api/ai/explain",e.serviceManager.serverSettings,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(i)});"explained"===p.status&&p.explanation&&(s=p.explanation.summary,o=p.explanation.details),el(eQ,{errorType:i.error_type,errorMessage:i.error_message,traceback:i.traceback,summary:s,details:o,fix:"A corrected cell will be generated locally when you apply the fix."},m,"suggest"===eY)}catch(e){el(eQ,{errorType:"Error analysis unavailable",errorMessage:"The platform could not diagnose this error.",traceback:"The backend returned no valid analysis.",summary:"The local platform could not validate the notebook error.",details:["Check the notebook output and retry the analysis."],fix:'print("Review the failing cell and confirm the variable or column exists.")'})}finally{eK.disabled=!1}}),eG.forEach((t,n)=>{t.addEventListener("click",()=>{if(eG.forEach(e=>e.classList.remove("active")),t.classList.add("active"),"Code Help"===n||"Ask AI"===n){eY="explain",(()=>{let t=en(a);if(!t||!(0,r.isCodeCellModel)(t.model)){let e=document.createElement("div");e.className="ml-assistant-empty",e.textContent="Select a code cell to ask local Ollama about it.",eQ.replaceChildren(e);return}let n=t.model.toJSON().source,i=(Array.isArray(n)?n.join(""):n).slice(0,2e4),s=a.currentWidget,o=document.createElement("textarea");o.className="ml-assistant-question-input",o.maxLength=1e3,o.value="Explain this cell and point out potential issues.";let l=document.createElement("label");l.className="ml-assistant-question-label",l.textContent="Ask a question about this cell",l.appendChild(o);let d=document.createElement("button");d.type="button",d.className="ml-assistant-cta-button",d.textContent="Ask Local Ollama";let c=document.createElement("div");c.className="ml-assistant-code-help-answer",eQ.replaceChildren(l,d,c),d.addEventListener("click",async()=>{let a=o.value.trim();if(!a){c.textContent="Enter a question about this code first.";return}d.disabled=!0,c.textContent="Asking local Ollama...";try{let n=await f("api/ai/code-help",e.serviceManager.serverSettings,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code:i,question:a,notebook_context:s&&t?er(s,t):""})});if(c.replaceChildren(),"explained"!==n.status||!n.explanation){c.textContent="model_missing"===n.status?`Install ${n.model_id||"the local Ollama model"} first.`:"Local Ollama could not answer this code question.";return}let r=document.createElement("p");r.textContent=n.explanation.summary;let o=document.createElement("ul");n.explanation.details.forEach(e=>{let t=document.createElement("li");t.textContent=e,o.appendChild(t)}),c.append(r,o)}catch(e){c.textContent="Local code help is unavailable right now."}finally{d.disabled=!1}})})();return}eY="Suggest Fix"===n?"suggest":"explain",eK.click()})}),eF.addEventListener("click",async()=>{if(!eZ)return void window.open("https://ollama.com/download","_blank","noopener,noreferrer");eF.disabled=!0;try{let t=await f("api/local-ai/install",e.serviceManager.serverSettings,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({allow_download:!0})});if("installed"===t.status){await e0(),el(eQ,{errorType:"Model installed",errorMessage:t.message||"Local model ready",traceback:"Installation completed successfully.",summary:"The recommended local model is available for notebook error explanations.",details:["The local Ollama path is now active."],fix:'print("Model ready. Re-run the failing cell to explain the error.")'});return}el(eQ,{errorType:"Local model installation failed",errorMessage:t.message||"The recommended Ollama model could not be installed.",traceback:"No notebook code was sent to a cloud service.",summary:"ModelMind could not finish downloading the local model.",details:["Check that Ollama is running and that this computer has an internet connection.","Retry after resolving the issue; the model is not installed until Ollama confirms it."],fix:"Restart Ollama and retry the model installation."})}catch(e){el(eQ,{errorType:"Local model installation failed",errorMessage:e instanceof Error?e.message:"The local model request failed.",traceback:"No notebook code was sent to a cloud service.",summary:"ModelMind could not finish downloading the local model.",details:["Check the local Jupyter server and Ollama status, then retry."],fix:"Restart the local ModelMind services and retry."})}finally{await e0()}}),e.shell.add(eb,"right",{rank:900}),window.addEventListener("modelmind:open-ai-assistant",t=>{var n,i;let r=g(null==(n=a.currentWidget)?void 0:n.context.model);if("plain"===r||"practice"===r)return;e.shell.activateById(eb.id);let s=(null==(i=null==t?void 0:t.detail)?void 0:i.mode)==="suggest"?"Suggest Fix":"Explain Error",o=eG.get(s)||eG.get("Explain Error");o?o.click():eK.click()}),function(e){if(A=e,z(),$||P(),document.getElementById("mm-tutor-fab"))return;let t=document.createElement("button");t.id="mm-tutor-fab",t.title="AI Debugger Tutor (Offline ML Guidance)",t.setAttribute("aria-label","Open AI Debugger Tutor");let a=document.createElement("div");a.className="badge",a.textContent="!",t.innerHTML=`<span>🎓</span>`,t.appendChild(a),t.addEventListener("click",I),document.body.appendChild(t)}(e.serviceManager.serverSettings);let e1=new c.Widget;e1.id="mm-ai-chatbot-panel",e1.title.label="AI Chat",e1.title.caption="AI Chatbot — powered by Ollama & Gemini",e1.addClass("mm-chatbot-widget");let e2=async e=>{var t,n;let i=null==(n=null==(t=a.currentWidget)?void 0:t.sessionContext.session)?void 0:n.kernel;if(!i||i.isDisposed)throw Error("Start a notebook kernel before capturing an execution trace.");let r=`__MODELMIND_TRACE_${Date.now()}__:`,s=`
import json as _mm_json
def _mm_trace_runner(_mm_source):
    import sys as _mm_sys
    import ast as _mm_ast
    _mm_tracked_names = {node.id for node in _mm_ast.walk(_mm_ast.parse(_mm_source)) if isinstance(node, _mm_ast.Name)}
    _mm_events = []
    _mm_filename = '<modelmind-execution-trace>'
    def _mm_trace(frame, event, arg):
        if frame.f_code.co_filename != _mm_filename:
            return None
        if event == 'line':
            if len(_mm_events) >= 1000:
                raise RuntimeError('Trace stopped after 1,000 Python line events.')
            _mm_variables = {}
            for _mm_name, _mm_value in frame.f_locals.items():
                if _mm_name not in _mm_tracked_names:
                    continue
                if isinstance(_mm_value, (str, int, float, bool, type(None))):
                    _mm_value_text = repr(_mm_value)
                elif isinstance(_mm_value, (list, tuple, dict)) and len(_mm_value) <= 16:
                    if all(isinstance(_mm_item, (str, int, float, bool, type(None))) for _mm_item in (_mm_value.values() if isinstance(_mm_value, dict) else _mm_value)):
                        _mm_value_text = repr(_mm_value)
                    else:
                        continue
                elif type(_mm_value).__module__.startswith('pandas') and hasattr(_mm_value, 'shape'):
                    _mm_value_text = '<' + type(_mm_value).__name__ + ' shape=' + str(_mm_value.shape) + '>'
                elif type(_mm_value).__module__.startswith('numpy') and hasattr(_mm_value, 'shape'):
                    _mm_value_text = '<' + type(_mm_value).__name__ + ' shape=' + str(_mm_value.shape) + ' dtype=' + str(getattr(_mm_value, 'dtype', 'unknown')) + '>'
                elif type(_mm_value).__module__.startswith('numpy') and hasattr(_mm_value, 'item'):
                    try:
                        _mm_value_text = repr(_mm_value.item())
                    except Exception:
                        continue
                else:
                    continue
                _mm_variables[_mm_name] = _mm_value_text[:240]
                if len(_mm_variables) >= 12:
                    break
            _mm_stack = []
            _mm_cursor = frame
            while _mm_cursor is not None and _mm_cursor.f_code.co_filename == _mm_filename:
                _mm_stack.append(_mm_cursor.f_code.co_name)
                _mm_cursor = _mm_cursor.f_back
            _mm_stack.reverse()
            _mm_events.append({'line': frame.f_lineno, 'functionName': frame.f_code.co_name, 'variables': _mm_variables, 'callStack': _mm_stack})
        return _mm_trace

    _mm_previous_trace = _mm_sys.gettrace()
    try:
        _mm_sys.settrace(_mm_trace)
        try:
            exec(compile(_mm_source, _mm_filename, 'exec'), get_ipython().user_ns, get_ipython().user_ns)
            return _mm_events, None, None
        except BaseException as _mm_exc:
            import traceback as _mm_traceback
            _mm_error_line = next((item.lineno for item in reversed(_mm_traceback.extract_tb(_mm_exc.__traceback__)) if item.filename == _mm_filename), None)
            return _mm_events, type(_mm_exc).__name__ + ': ' + str(_mm_exc), _mm_error_line
    finally:
        _mm_sys.settrace(_mm_previous_trace)

_mm_events, _mm_error, _mm_error_line = _mm_trace_runner(${JSON.stringify(e)})
print(${JSON.stringify(r)} + _mm_json.dumps({'events': _mm_events, 'error': _mm_error, 'errorLine': _mm_error_line}))
del _mm_events, _mm_error, _mm_error_line, _mm_trace_runner, _mm_json
`,o="",l=i.requestExecute({code:s,silent:!1,store_history:!1,allow_stdin:!1,stop_on_error:!0});l.onIOPub=e=>{var t;"stream"===e.header.msg_type&&(o+=null!=(t=e.content.text)?t:"")},await l.done;let d=o.lastIndexOf(r);if(d<0)throw Error("The kernel did not return a trace. Check that it is responsive, then try again.");let c=o.slice(0,d).trim(),m=JSON.parse(o.slice(d+r.length).trim());return{events:Array.isArray(m.events)?m.events:[],output:c,error:m.error||void 0,errorLine:"number"==typeof m.errorLine?m.errorLine:void 0}},e5=async()=>{var e,t;let n=null==(t=null==(e=a.currentWidget)?void 0:e.sessionContext.session)?void 0:t.kernel;if(!n||n.isDisposed)throw Error("Start a notebook kernel and fit a decision tree before opening this view.");let i=`__MODELMIND_TREES_${Date.now()}__:`,r=`
import json as _mm_json
def _mm_describe_tree(_mm_name, _mm_estimator, _mm_namespace):
    _mm_tree = _mm_estimator.tree_
    _mm_task = 'classification' if hasattr(_mm_estimator, 'classes_') else 'regression'
    _mm_class_values = getattr(_mm_estimator, 'classes_', [])
    if hasattr(_mm_class_values, 'tolist'):
        _mm_class_values = _mm_class_values.tolist()
    _mm_feature_names = getattr(_mm_estimator, 'feature_names_in_', [])
    if hasattr(_mm_feature_names, 'tolist'):
        _mm_feature_names = _mm_feature_names.tolist()
    if not _mm_feature_names:
        for _mm_data_name in ('X_train', 'X', 'features'):
            _mm_data = _mm_namespace.get(_mm_data_name)
            if hasattr(_mm_data, 'columns'):
                _mm_feature_names = [str(_mm_column) for _mm_column in _mm_data.columns]
                break
    _mm_depths = [0] * _mm_tree.node_count
    _mm_stack = [(0, 0)]
    while _mm_stack:
        _mm_index, _mm_depth = _mm_stack.pop()
        if _mm_index >= _mm_tree.node_count:
            continue
        _mm_depths[_mm_index] = _mm_depth
        _mm_left = int(_mm_tree.children_left[_mm_index])
        _mm_right = int(_mm_tree.children_right[_mm_index])
        if _mm_left != _mm_right:
            _mm_stack.append((_mm_right, _mm_depth + 1))
            _mm_stack.append((_mm_left, _mm_depth + 1))
    _mm_nodes = []
    for _mm_index in range(int(_mm_tree.node_count)):
        if _mm_depths[_mm_index] > 10:
            continue
        _mm_left = int(_mm_tree.children_left[_mm_index])
        _mm_right = int(_mm_tree.children_right[_mm_index])
        _mm_leaf = _mm_left == _mm_right
        _mm_feature_index = int(_mm_tree.feature[_mm_index])
        _mm_feature = str(_mm_feature_names[_mm_feature_index]) if 0 <= _mm_feature_index < len(_mm_feature_names) else 'feature_' + str(_mm_feature_index)
        _mm_values = _mm_tree.value[_mm_index][0].tolist()
        if _mm_task == 'classification' and _mm_values:
            _mm_prediction_index = max(range(len(_mm_values)), key=lambda _mm_i: _mm_values[_mm_i])
            _mm_prediction = str(_mm_class_values[_mm_prediction_index]) if _mm_prediction_index < len(_mm_class_values) else 'class ' + str(_mm_prediction_index)
        else:
            _mm_prediction = str(_mm_values[0]) if _mm_values else 'unknown'
        _mm_nodes.append({
            'id': _mm_index,
            'depth': _mm_depths[_mm_index],
            'left': None if _mm_leaf else _mm_left,
            'right': None if _mm_leaf else _mm_right,
            'feature': _mm_feature,
            'threshold': None if _mm_leaf else float(_mm_tree.threshold[_mm_index]),
            'samples': int(_mm_tree.n_node_samples[_mm_index]),
            'impurity': float(_mm_tree.impurity[_mm_index]),
            'prediction': _mm_prediction
        })
    return {
        'modelName': _mm_name,
        'task': _mm_task,
        'criterion': str(getattr(_mm_estimator, 'criterion', 'tree split')),
        'nodeCount': int(_mm_tree.node_count),
        'maxDepth': int(_mm_tree.max_depth),
        'nodes': _mm_nodes
    }

_mm_namespace = get_ipython().user_ns
_mm_trees = []
_mm_seen = set()
for _mm_name, _mm_object in list(_mm_namespace.items()):
    # IPython stores the previous cell result under _, __, and ___. These can
    # point at an older fitted tree and should not appear as named user models.
    if _mm_name.startswith('_') or _mm_name in ('In', 'Out'):
        continue
    _mm_candidates = [(_mm_name, _mm_object)]
    for _mm_step_name, _mm_step in getattr(_mm_object, 'steps', []) or []:
        _mm_candidates.append((_mm_name + '.' + str(_mm_step_name), _mm_step))
    for _mm_candidate_name, _mm_candidate in _mm_candidates:
        try:
            _mm_tree_id = id(_mm_candidate)
            if _mm_tree_id in _mm_seen or not hasattr(_mm_candidate, 'tree_'):
                continue
            _mm_seen.add(_mm_tree_id)
            _mm_trees.append(_mm_describe_tree(_mm_candidate_name, _mm_candidate, _mm_namespace))
        except Exception:
            continue
    if len(_mm_trees) >= 10:
        break
print(${JSON.stringify(i)} + _mm_json.dumps(_mm_trees))
for _mm_cleanup_name in ('_mm_describe_tree', '_mm_namespace', '_mm_trees', '_mm_seen', '_mm_name', '_mm_object', '_mm_candidates', '_mm_candidate_name', '_mm_candidate', '_mm_step_name', '_mm_step', '_mm_tree_id', '_mm_json'):
    get_ipython().user_ns.pop(_mm_cleanup_name, None)
`,s="",o=n.requestExecute({code:r,silent:!1,store_history:!1,allow_stdin:!1,stop_on_error:!0});o.onIOPub=e=>{var t;"stream"===e.header.msg_type&&(s+=null!=(t=e.content.text)?t:"")},await o.done;let l=s.lastIndexOf(i);if(l<0)throw Error("Could not read a fitted tree from the current kernel. Confirm the model was fitted with scikit-learn.");return JSON.parse(s.slice(l+i.length).trim())},e4=async()=>{var e,t;let n=null==(t=null==(e=a.currentWidget)?void 0:e.sessionContext.session)?void 0:t.kernel;if(!n||n.isDisposed)throw Error("Start a notebook kernel and fit a neural network before opening this view.");let i=`__MODELMIND_NEURAL_NETWORKS_${Date.now()}__:`,r=`
import json as _mm_json
def _mm_even_samples(_mm_size, _mm_limit=12):
    if _mm_size <= _mm_limit:
        return list(range(_mm_size))
    return sorted(set(round(_mm_i * (_mm_size - 1) / (_mm_limit - 1)) for _mm_i in range(_mm_limit)))
_mm_namespace = get_ipython().user_ns
_mm_networks = []
_mm_seen = set()
for _mm_name, _mm_object in list(_mm_namespace.items()):
    if _mm_name.startswith('_') or _mm_name in ('In', 'Out'):
        continue
    _mm_parent_features = getattr(_mm_object, 'feature_names_in_', [])
    if hasattr(_mm_parent_features, 'tolist'):
        _mm_parent_features = _mm_parent_features.tolist()
    _mm_candidates = [(_mm_name, _mm_object, _mm_parent_features)]
    for _mm_step_name, _mm_step in getattr(_mm_object, 'steps', []) or []:
        _mm_candidates.append((_mm_name + '.' + str(_mm_step_name), _mm_step, _mm_parent_features))
    for _mm_candidate_name, _mm_model, _mm_parent_feature_names in _mm_candidates:
        try:
            _mm_kind = type(_mm_model).__name__
            if _mm_kind not in ('MLPClassifier', 'MLPRegressor') or not hasattr(_mm_model, 'coefs_'):
                continue
            if id(_mm_model) in _mm_seen:
                continue
            _mm_seen.add(id(_mm_model))
            _mm_coefs = _mm_model.coefs_
            _mm_sizes = [int(_mm_coefs[0].shape[0])] + [int(_mm_matrix.shape[1]) for _mm_matrix in _mm_coefs]
            _mm_indices = [_mm_even_samples(_mm_size) for _mm_size in _mm_sizes]
            _mm_features = getattr(_mm_model, 'feature_names_in_', [])
            if hasattr(_mm_features, 'tolist'):
                _mm_features = _mm_features.tolist()
            if len(_mm_features) != _mm_sizes[0]:
                _mm_features = _mm_parent_feature_names
            if len(_mm_features) != _mm_sizes[0]:
                _mm_features = []
                for _mm_data_name in ('X_train_scaled', 'X_train', 'X', 'features'):
                    _mm_data = _mm_namespace.get(_mm_data_name)
                    if hasattr(_mm_data, 'columns') and len(_mm_data.columns) == _mm_sizes[0]:
                        _mm_features = [str(_mm_column) for _mm_column in _mm_data.columns]
                        break
            _mm_classes = getattr(_mm_model, 'classes_', [])
            if hasattr(_mm_classes, 'tolist'):
                _mm_classes = _mm_classes.tolist()
            _mm_layers = []
            for _mm_layer_index, _mm_size in enumerate(_mm_sizes):
                if _mm_layer_index == 0:
                    _mm_label = 'Input'
                elif _mm_layer_index == len(_mm_sizes) - 1:
                    _mm_label = 'Output'
                else:
                    _mm_label = 'Hidden ' + str(_mm_layer_index)
                _mm_nodes = []
                for _mm_node_index in _mm_indices[_mm_layer_index]:
                    _mm_node_label = 'unit ' + str(_mm_node_index)
                    if _mm_layer_index == 0 and len(_mm_features) == _mm_size:
                        _mm_node_label = str(_mm_features[_mm_node_index])
                    elif _mm_layer_index == len(_mm_sizes) - 1 and len(_mm_classes) == _mm_size:
                        _mm_node_label = str(_mm_classes[_mm_node_index])
                    _mm_nodes.append({'index': int(_mm_node_index), 'label': _mm_node_label})
                _mm_layers.append({'label': _mm_label, 'size': _mm_size, 'nodes': _mm_nodes})
            _mm_connections = []
            for _mm_layer_index, _mm_matrix in enumerate(_mm_coefs):
                for _mm_from_index in _mm_indices[_mm_layer_index]:
                    for _mm_to_index in _mm_indices[_mm_layer_index + 1]:
                        _mm_connections.append({
                            'fromLayer': _mm_layer_index,
                            'fromNode': int(_mm_from_index),
                            'toNode': int(_mm_to_index),
                            'weight': float(_mm_matrix[_mm_from_index, _mm_to_index])
                        })
            _mm_networks.append({
                'modelName': _mm_candidate_name,
                'modelType': _mm_kind,
                'task': 'classification' if _mm_kind == 'MLPClassifier' else 'regression',
                'activation': str(getattr(_mm_model, 'activation', 'unknown')),
                'outputActivation': str(getattr(_mm_model, 'out_activation_', 'unknown')),
                'loss': str(getattr(_mm_model, 'loss_', 'unknown')),
                'epochs': int(getattr(_mm_model, 'n_iter_', 0)),
                'layers': _mm_layers,
                'connections': _mm_connections,
                'classes': [str(_mm_class) for _mm_class in _mm_classes]
            })
        except Exception:
            continue
    if len(_mm_networks) >= 10:
        break
print(${JSON.stringify(i)} + _mm_json.dumps(_mm_networks))
for _mm_cleanup_name in ('_mm_even_samples', '_mm_namespace', '_mm_networks', '_mm_seen', '_mm_name', '_mm_object', '_mm_parent_features', '_mm_candidates', '_mm_step_name', '_mm_step', '_mm_candidate_name', '_mm_model', '_mm_parent_feature_names', '_mm_kind', '_mm_coefs', '_mm_sizes', '_mm_indices', '_mm_features', '_mm_data_name', '_mm_data', '_mm_column', '_mm_classes', '_mm_layers', '_mm_layer_index', '_mm_size', '_mm_label', '_mm_nodes', '_mm_node_index', '_mm_node_label', '_mm_connections', '_mm_matrix', '_mm_from_index', '_mm_to_index', '_mm_json'):
    get_ipython().user_ns.pop(_mm_cleanup_name, None)
`,s="",o=n.requestExecute({code:r,silent:!1,store_history:!1,allow_stdin:!1,stop_on_error:!0});o.onIOPub=e=>{var t;"stream"===e.header.msg_type&&(s+=null!=(t=e.content.text)?t:"")},await o.done;let l=s.lastIndexOf(i);if(l<0)throw Error("Could not inspect fitted neural networks. Fit a scikit-learn MLPClassifier or MLPRegressor first.");return JSON.parse(s.slice(l+i.length).trim())},e3=async()=>{var e,t;let n=null==(t=null==(e=a.currentWidget)?void 0:e.sessionContext.session)?void 0:t.kernel;if(!n||n.isDisposed)throw Error("Start a notebook kernel and define feature and target variables before training.");let i=`__MODELMIND_TRAINING_SOURCES_${Date.now()}__:`,r=`
import json as _mm_json
from sklearn.utils.multiclass import type_of_target as _mm_type_of_target
_mm_ns = get_ipython().user_ns
_mm_pairs = [
    ('X_train', 'y_train', 'X_test', 'y_test'),
    ('X_train_scaled', 'y_train', 'X_test_scaled', 'y_test'),
    ('X', 'y', None, None),
    ('features', 'target', None, None)
]
_mm_sources = []
_mm_seen = set()
for _mm_x_name, _mm_y_name, _mm_x_test_name, _mm_y_test_name in _mm_pairs:
    _mm_key = (_mm_x_name, _mm_y_name)
    if _mm_key in _mm_seen:
        continue
    _mm_seen.add(_mm_key)
    _mm_x = _mm_ns.get(_mm_x_name)
    _mm_y = _mm_ns.get(_mm_y_name)
    if _mm_x is None or _mm_y is None:
        continue
    try:
        _mm_rows = len(_mm_x)
        _mm_features = int(_mm_x.shape[1])
        if _mm_rows < 5 or _mm_features < 1 or len(_mm_y) != _mm_rows:
            continue
        _mm_target_kind = _mm_type_of_target(_mm_y)
        if _mm_target_kind in ('binary', 'multiclass'):
            _mm_task = 'classification'
        elif _mm_target_kind in ('continuous', 'continuous-multioutput'):
            _mm_task = 'regression'
        else:
            continue
        _mm_has_test = bool(_mm_x_test_name and _mm_y_test_name and _mm_ns.get(_mm_x_test_name) is not None and _mm_ns.get(_mm_y_test_name) is not None)
        _mm_sources.append({
            'id': _mm_x_name + '|' + _mm_y_name,
            'featuresName': _mm_x_name,
            'targetName': _mm_y_name,
            'testFeaturesName': _mm_x_test_name if _mm_has_test else None,
            'testTargetName': _mm_y_test_name if _mm_has_test else None,
            'rows': _mm_rows,
            'featureCount': _mm_features,
            'task': _mm_task
        })
    except Exception:
        continue
print(${JSON.stringify(i)} + _mm_json.dumps(_mm_sources))
for _mm_cleanup in ('_mm_type_of_target', '_mm_ns', '_mm_pairs', '_mm_sources', '_mm_seen', '_mm_x_name', '_mm_y_name', '_mm_x_test_name', '_mm_y_test_name', '_mm_key', '_mm_x', '_mm_y', '_mm_rows', '_mm_features', '_mm_target_kind', '_mm_task', '_mm_has_test', '_mm_json'):
    get_ipython().user_ns.pop(_mm_cleanup, None)
`,s="",o=n.requestExecute({code:r,silent:!1,store_history:!1,allow_stdin:!1,stop_on_error:!0});o.onIOPub=e=>{var t;"stream"===e.header.msg_type&&(s+=null!=(t=e.content.text)?t:"")},await o.done;let l=s.lastIndexOf(i);if(l<0)throw Error("Could not inspect feature/target variables in the current kernel.");return JSON.parse(s.slice(l+i.length).trim())},e6=async(e,t)=>{var n,i;let r=null==(i=null==(n=a.currentWidget)?void 0:n.sessionContext.session)?void 0:i.kernel;if(!r||r.isDisposed)throw Error("Start a notebook kernel before training a model.");let[s,o]=e.split("|");if(!s||!o)throw Error("Choose a valid feature and target pair.");if(!["decision_tree","random_forest","neural_network"].includes(t))throw Error("Choose a supported model type.");let l=`__MODELMIND_TRAINED_MODEL_${Date.now()}__:`,d=JSON.stringify({featuresName:s,targetName:o,modelType:t}),c=`
import json as _mm_json
import numpy as _mm_np
from sklearn.model_selection import train_test_split as _mm_train_test_split
from sklearn.utils.multiclass import type_of_target as _mm_type_of_target
from sklearn.metrics import accuracy_score as _mm_accuracy, f1_score as _mm_f1, mean_absolute_error as _mm_mae, mean_squared_error as _mm_mse, r2_score as _mm_r2
from sklearn.tree import DecisionTreeClassifier as _mm_DTC, DecisionTreeRegressor as _mm_DTR
from sklearn.ensemble import RandomForestClassifier as _mm_RFC, RandomForestRegressor as _mm_RFR
from sklearn.neural_network import MLPClassifier as _mm_MLPC, MLPRegressor as _mm_MLPR
from sklearn.pipeline import make_pipeline as _mm_make_pipeline
from sklearn.preprocessing import StandardScaler as _mm_StandardScaler
_mm_args = _mm_json.loads(${JSON.stringify(d)})
_mm_ns = get_ipython().user_ns
_mm_X = _mm_ns.get(_mm_args['featuresName'])
_mm_y = _mm_ns.get(_mm_args['targetName'])
if _mm_X is None or _mm_y is None:
    raise ValueError('The selected feature/target variables are no longer available. Run their notebook cells again.')
if len(_mm_X) != len(_mm_y):
    raise ValueError('Features and target have different row counts.')
if hasattr(_mm_X, 'select_dtypes'):
    _mm_bad = list(_mm_X.select_dtypes(include=['object', 'string', 'category']).columns)
    if _mm_bad:
        raise ValueError('Encode categorical feature columns first (for example, with pd.get_dummies(X)).')
elif getattr(_mm_X, 'dtype', None) is not None and _mm_X.dtype.kind not in 'biufc':
    raise ValueError('Encode categorical feature columns first (for example, with pd.get_dummies(X)).')
_mm_target_kind = _mm_type_of_target(_mm_y)
if _mm_target_kind in ('binary', 'multiclass'):
    _mm_task = 'classification'
elif _mm_target_kind in ('continuous', 'continuous-multioutput'):
    _mm_task = 'regression'
else:
    raise ValueError('This target type is not supported. Use a one-dimensional classification or regression target.')
_mm_X_test = None
_mm_y_test = None
_mm_test_x_name = _mm_args['featuresName'].replace('X_train_scaled', 'X_test_scaled').replace('X_train', 'X_test')
_mm_test_y_name = _mm_args['targetName'].replace('y_train', 'y_test')
if _mm_args['featuresName'] in ('X_train', 'X_train_scaled') and _mm_test_x_name != _mm_args['featuresName']:
    _mm_X_test = _mm_ns.get(_mm_test_x_name)
    _mm_y_test = _mm_ns.get(_mm_test_y_name)
if _mm_X_test is not None and _mm_y_test is not None:
    _mm_X_train, _mm_y_train = _mm_X, _mm_y
    if len(_mm_X_test) != len(_mm_y_test):
        raise ValueError('The existing test features and target have different row counts.')
else:
    _mm_stratify = None
    if _mm_task == 'classification':
        _mm_values, _mm_counts = _mm_np.unique(_mm_y, return_counts=True)
        if len(_mm_counts) > 1 and _mm_counts.min() >= 2:
            _mm_stratify = _mm_y
    _mm_X_train, _mm_X_test, _mm_y_train, _mm_y_test = _mm_train_test_split(
        _mm_X, _mm_y, test_size=0.2, random_state=42, stratify=_mm_stratify
    )
_mm_type = _mm_args['modelType']
if _mm_task == 'classification':
    if _mm_type == 'decision_tree': _mm_estimator = _mm_DTC(max_depth=6, random_state=42)
    elif _mm_type == 'random_forest': _mm_estimator = _mm_RFC(n_estimators=150, random_state=42, n_jobs=-1)
    else: _mm_estimator = _mm_make_pipeline(_mm_StandardScaler(with_mean=False), _mm_MLPC(hidden_layer_sizes=(32, 16), max_iter=500, random_state=42))
else:
    if _mm_type == 'decision_tree': _mm_estimator = _mm_DTR(max_depth=6, random_state=42)
    elif _mm_type == 'random_forest': _mm_estimator = _mm_RFR(n_estimators=150, random_state=42, n_jobs=-1)
    else: _mm_estimator = _mm_make_pipeline(_mm_StandardScaler(with_mean=False), _mm_MLPR(hidden_layer_sizes=(32, 16), max_iter=500, random_state=42))
_mm_estimator.fit(_mm_X_train, _mm_y_train)
_mm_prediction = _mm_estimator.predict(_mm_X_test)
if _mm_task == 'classification':
    _mm_primary = float(_mm_accuracy(_mm_y_test, _mm_prediction))
    _mm_metric = 'Accuracy'
    _mm_secondary = [{'label': 'Macro F1', 'value': float(_mm_f1(_mm_y_test, _mm_prediction, average='macro', zero_division=0))}]
else:
    _mm_primary = float(_mm_r2(_mm_y_test, _mm_prediction))
    _mm_metric = 'R\xb2'
    _mm_secondary = [
        {'label': 'MAE', 'value': float(_mm_mae(_mm_y_test, _mm_prediction))},
        {'label': 'RMSE', 'value': float(_mm_np.sqrt(_mm_mse(_mm_y_test, _mm_prediction)))}
    ]
_mm_ns['modelmind_trained_model'] = _mm_estimator
_mm_result = {
    'modelName': 'modelmind_trained_model',
    'modelType': _mm_type.replace('_', ' ').title(),
    'task': _mm_task,
    'trainRows': int(len(_mm_X_train)),
    'testRows': int(len(_mm_X_test)),
    'featureCount': int(_mm_X.shape[1]),
    'primaryMetric': _mm_metric,
    'primaryScore': _mm_primary,
    'secondaryMetrics': _mm_secondary
}
print(${JSON.stringify(l)} + _mm_json.dumps(_mm_result))
for _mm_cleanup in ('_mm_args', '_mm_ns', '_mm_X', '_mm_y', '_mm_bad', '_mm_target_kind', '_mm_task', '_mm_X_test', '_mm_y_test', '_mm_test_x_name', '_mm_test_y_name', '_mm_stratify', '_mm_values', '_mm_counts', '_mm_X_train', '_mm_y_train', '_mm_type', '_mm_estimator', '_mm_prediction', '_mm_primary', '_mm_metric', '_mm_secondary', '_mm_result', '_mm_json', '_mm_np', '_mm_train_test_split', '_mm_type_of_target', '_mm_accuracy', '_mm_f1', '_mm_mae', '_mm_mse', '_mm_r2', '_mm_DTC', '_mm_DTR', '_mm_RFC', '_mm_RFR', '_mm_MLPC', '_mm_MLPR', '_mm_make_pipeline', '_mm_StandardScaler'):
    get_ipython().user_ns.pop(_mm_cleanup, None)
`,m="",p="",u=r.requestExecute({code:c,silent:!1,store_history:!1,allow_stdin:!1,stop_on_error:!0});u.onIOPub=e=>{var t,a;"stream"===e.header.msg_type&&(m+=null!=(t=e.content.text)?t:""),"error"===e.header.msg_type&&(p=null!=(a=e.content.evalue)?a:"Python training failed.")},await u.done;let f=m.lastIndexOf(l);if(f<0)throw Error(p||"Python training did not return evaluation results.");return JSON.parse(m.slice(f+l.length).replace(/^\s+/,"").split(/\r?\n/,1)[0])},e8=function(e,t,a,n,i,r,s,o){if(document.getElementById("mm-chatbot-styles")){let e=document.getElementById("mm-chatbot-styles");e&&e.remove()}let l=document.createElement("style");l.id="mm-chatbot-styles",l.textContent=`
    /* ═══════════════════════════════════════════════
       AI CHATBOT PANEL — AI Assistant Matching Theme
    ═══════════════════════════════════════════════ */
    .mm-chatbot-root {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-width: 0;
      background: var(--ml-assistant-panel-bg, #f5f6f8);
      color: var(--ml-assistant-text, #253041);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      overflow: hidden;
      position: relative;
      border-left: 1px solid var(--ml-assistant-border, #dfe3ea);
      container-name: mm-chatbot;
      container-type: inline-size;
    }

    .mm-chatbot-drop-overlay {
      position: absolute;
      inset: 10px;
      z-index: 20;
      display: none;
      align-items: center;
      justify-content: center;
      border: 2px dashed var(--ml-assistant-accent, #6d7cff);
      border-radius: 14px;
      background: rgba(238, 242, 255, 0.94);
      color: #4338ca;
      font-size: 14px;
      font-weight: 700;
      pointer-events: none;
    }

    .mm-chatbot-root.mm-chatbot-dragging-files .mm-chatbot-drop-overlay { display: flex; }

    /* Header matching AI Assistant */
    .mm-chatbot-header {
      flex-shrink: 0;
      padding: 14px 14px 10px;
      background: var(--ml-assistant-card-bg, #ffffff);
      border-bottom: 1px solid var(--ml-assistant-border, #dfe3ea);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .mm-chatbot-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      min-width: 0;
    }

    .mm-chatbot-title {
      min-width: 0;
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--ml-assistant-text, #253041);
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
    }

    .mm-chatbot-title-icon {
      font-size: 18px;
      line-height: 1;
    }

    /* Provider Switch styled like AI Assistant tabs / buttons */
    .mm-chatbot-provider-switch {
      display: flex;
      align-items: center;
      flex-shrink: 0;
      gap: 6px;
      background: var(--ml-assistant-panel-bg, #f5f6f8);
      padding: 3px;
      border-radius: 8px;
      border: 1px solid var(--ml-assistant-border, #dfe3ea);
    }

    .mm-chatbot-provider-btn {
      min-width: 0;
      padding: 4px 10px;
      border-radius: 6px;
      border: 1px solid transparent;
      background: transparent;
      color: var(--ml-assistant-muted, #5d6b80);
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .mm-chatbot-provider-btn:hover:not(.active-ollama):not(.active-gemini) {
      color: var(--ml-assistant-text, #253041);
      background: rgba(255, 255, 255, 0.7);
    }

    .mm-chatbot-provider-btn.active-ollama {
      background: var(--ml-assistant-card-bg, #ffffff);
      border-color: var(--ml-assistant-border, #dfe3ea);
      color: #6b21a8;
      box-shadow: 0 1px 3px var(--ml-assistant-shadow, rgba(31, 41, 55, 0.08));
    }

    .mm-chatbot-provider-btn.active-gemini {
      background: var(--ml-assistant-card-bg, #ffffff);
      border-color: var(--ml-assistant-border, #dfe3ea);
      color: #173ea5;
      box-shadow: 0 1px 3px var(--ml-assistant-shadow, rgba(31, 41, 55, 0.08));
    }

    /* Status row matching AI Assistant */
    .mm-chatbot-status-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .mm-chatbot-status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border-radius: 999px;
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 600;
      background: var(--ml-assistant-success-bg, #dff5eb);
      color: var(--ml-assistant-success-text, #1d7b54);
      border: 1px solid transparent;
    }

    .mm-chatbot-status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #10b981;
    }

    .mm-chatbot-status-pill.offline {
      background: var(--ml-assistant-warn-bg, #fdf0d5);
      color: var(--ml-assistant-warn-text, #9c6b11);
    }

    .mm-chatbot-status-pill.offline .mm-chatbot-status-dot {
      background: #f59e0b;
    }

    /* Context row matching AI Assistant secondary controls */
    .mm-chatbot-context-bar {
      flex-shrink: 0;
      padding: 7px 14px;
      background: var(--ml-assistant-panel-bg, #f5f6f8);
      border-bottom: 1px solid var(--ml-assistant-border, #dfe3ea);
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      color: var(--ml-assistant-muted, #5d6b80);
      font-weight: 600;
      flex-wrap: wrap;
    }

    .mm-chatbot-context-chip {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 10px;
      border-radius: 999px;
      background: var(--ml-assistant-card-bg, #ffffff);
      border: 1px solid var(--ml-assistant-border, #dfe3ea);
      color: var(--ml-assistant-text, #253041);
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
    }

    .mm-chatbot-context-chip:hover {
      background: var(--ml-assistant-accent-soft, #eef1ff);
      border-color: var(--ml-assistant-accent, #6d7cff);
      color: var(--ml-assistant-accent, #6d7cff);
    }

    /* Messages thread */
    .mm-chatbot-messages {
      flex: 1;
      overflow-y: auto;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      background: var(--ml-assistant-panel-bg, #f5f6f8);
      scroll-behavior: smooth;
      min-width: 0;
    }

    .mm-chatbot-messages::-webkit-scrollbar {
      width: 5px;
    }
    .mm-chatbot-messages::-webkit-scrollbar-track {
      background: transparent;
    }
    .mm-chatbot-messages::-webkit-scrollbar-thumb {
      background: var(--ml-assistant-border, #dfe3ea);
      border-radius: 99px;
    }
    .mm-chatbot-messages::-webkit-scrollbar-thumb:hover {
      background: #cbd5e1;
    }

    /* Welcome / Empty State matching AI Assistant */
    .mm-chat-welcome {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 14px;
      padding: 24px 16px;
      text-align: center;
      background: var(--ml-assistant-card-bg, #ffffff);
      border: 1px solid var(--ml-assistant-border, #dfe3ea);
      border-radius: 12px;
      box-shadow: 0 1px 3px var(--ml-assistant-shadow, rgba(31, 41, 55, 0.05));
      margin: auto 0;
    }

    .mm-chat-welcome-icon {
      font-size: 36px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--ml-assistant-accent-soft, #eef1ff);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--ml-assistant-accent, #6d7cff);
    }

    .mm-chat-welcome-title {
      font-size: 15px;
      font-weight: 700;
      color: var(--ml-assistant-text, #253041);
      margin: 0;
    }

    .mm-chat-welcome-sub {
      font-size: 12px;
      color: var(--ml-assistant-muted, #5d6b80);
      line-height: 1.5;
      max-width: 260px;
      margin: 0;
    }

    .mm-chat-suggestions {
      display: flex;
      flex-direction: column;
      gap: 6px;
      width: 100%;
      margin-top: 6px;
    }

    .mm-chat-suggestion-chip {
      padding: 9px 12px;
      border-radius: 8px;
      border: 1px solid var(--ml-assistant-border, #dfe3ea);
      background: var(--ml-assistant-panel-bg, #f8fafc);
      color: var(--ml-assistant-text, #253041);
      font-size: 11.5px;
      font-weight: 500;
      cursor: pointer;
      text-align: left;
      transition: all 0.15s ease;
      line-height: 1.4;
    }

    .mm-chat-suggestion-chip:hover {
      border-color: var(--ml-assistant-accent, #6d7cff);
      background: var(--ml-assistant-accent-soft, #eef1ff);
      color: #312e81;
      transform: translateX(2px);
    }

    /* Message Bubbles */
    .mm-chat-msg {
      display: flex;
      gap: 9px;
      max-width: 100%;
      min-width: 0;
    }

    .mm-chat-msg-user {
      flex-direction: row-reverse;
      align-self: flex-end;
    }

    .mm-chat-msg-assistant {
      align-self: flex-start;
    }

    .mm-chat-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      flex-shrink: 0;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .mm-chat-avatar-user {
      background: #e0e7ff;
      border: 1px solid #c7d2fe;
      color: #4338ca;
    }

    .mm-chat-avatar-assistant {
      background: var(--ml-assistant-accent-soft, #eef1ff);
      border: 1px solid rgba(109, 124, 255, 0.3);
      color: var(--ml-assistant-accent, #6d7cff);
    }

    .mm-chat-bubble-container {
      display: flex;
      flex-direction: column;
      gap: 3px;
      max-width: calc(100% - 38px);
      min-width: 0;
    }

    .mm-chat-bubble-header {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 10.5px;
      color: var(--ml-assistant-muted, #5d6b80);
      padding: 0 3px;
    }

    .mm-chat-bubble-header-user {
      justify-content: flex-end;
    }

    .mm-chat-sender-name {
      font-weight: 700;
      color: var(--ml-assistant-text, #253041);
    }

    .mm-chat-provider-badge {
      display: inline-flex;
      align-items: center;
      padding: 1px 6px;
      border-radius: 999px;
      font-size: 9.5px;
      font-weight: 600;
    }

    .mm-chat-badge-gemini {
      background: #edf4ff;
      border: 1px solid #d3e3ff;
      color: #173ea5;
    }

    .mm-chat-badge-ollama {
      background: #f5f3ff;
      border: 1px solid #ddd6fe;
      color: #6b21a8;
    }

    .mm-chat-time {
      font-size: 10px;
      color: #94a3b8;
    }

    /* Bubble bodies matching AI Assistant Cards */
    .mm-chat-bubble {
      padding: 11px 13px;
      border-radius: 10px;
      font-size: 12px;
      line-height: 1.55;
      word-break: break-word;
    }

    .mm-chat-bubble-user {
      background: var(--ml-assistant-accent-soft, #eef1ff);
      border: 1px solid #d3e3ff;
      border-top-right-radius: 2px;
      color: #1e1b4b;
      box-shadow: 0 1px 2px rgba(109, 124, 255, 0.06);
    }

    .mm-chat-bubble-assistant {
      background: var(--ml-assistant-card-bg, #ffffff);
      border: 1px solid var(--ml-assistant-border, #dfe3ea);
      border-top-left-radius: 2px;
      color: var(--ml-assistant-text, #253041);
      box-shadow: 0 1px 3px var(--ml-assistant-shadow, rgba(31, 41, 55, 0.06));
    }

    .mm-chat-bubble-error {
      background: var(--ml-assistant-error-bg, #fff1f1) !important;
      border: 1px solid rgb(163 61 77 / 20%) !important;
      color: var(--ml-assistant-error-text, #a33d4d) !important;
    }

    /* Message content */
    .mm-chat-msg-content {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .mm-chat-text-seg {
      color: inherit;
      font-size: 12px;
      line-height: 1.6;
    }

    .mm-chat-text-seg strong {
      color: #0f172a;
      font-weight: 700;
    }

    .mm-chat-text-seg em {
      color: #4338ca;
    }

    .mm-chat-inline-code {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 1px 5px;
      font-family: 'Fira Code', Menlo, Monaco, Consolas, monospace;
      font-size: 11px;
      color: #0f172a;
    }

    /* Code block matching AI Assistant style */
    .mm-chat-code-block {
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #cbd5e1;
      background: #1e293b;
      margin: 4px 0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .mm-chat-code-lang {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 5px 10px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }

    .mm-chat-code-lang span {
      font-size: 10px;
      color: #475569;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .mm-chat-copy-btn {
      font-size: 10px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 4px;
      border: 1px solid #cbd5e1;
      background: #ffffff;
      color: #475569;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .mm-chat-copy-btn:hover {
      background: #f1f5f9;
      border-color: #94a3b8;
      color: #1e293b;
    }

    .mm-chat-code-block pre {
      margin: 0;
      padding: 11px 13px;
      overflow-x: auto;
      background: #1e293b;
    }

    .mm-chat-code-block code {
      font-family: 'Fira Code', Menlo, Monaco, Consolas, monospace;
      font-size: 11.5px;
      line-height: 1.55;
      color: #f8fafc;
      white-space: pre;
    }

    /* Typing animation */
    .mm-chat-bubble-streaming {
      padding: 12px 16px;
    }

    .mm-chat-typing-dots {
      display: flex;
      gap: 5px;
      align-items: center;
    }

    .mm-chat-typing-dots span {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--ml-assistant-accent, #6d7cff);
      animation: mm-typing 1.2s infinite;
    }

    .mm-chat-typing-dots span:nth-child(2) { animation-delay: 0.2s; }
    .mm-chat-typing-dots span:nth-child(3) { animation-delay: 0.4s; }

    .mm-chat-stream-cursor {
      display: inline-block;
      height: 1.1em;
      margin-left: 2px;
      border-left: 2px solid var(--ml-assistant-accent, #6d7cff);
      vertical-align: text-bottom;
      animation: mm-cursor-blink 0.8s steps(2, start) infinite;
    }

    @keyframes mm-cursor-blink {
      to { visibility: hidden; }
    }

    @keyframes mm-typing {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.35; }
      30% { transform: translateY(-5px); opacity: 1; }
    }

    /* Input Area matching AI Assistant form inputs */
    .mm-chatbot-input-area {
      flex-shrink: 0;
      padding: 10px 14px 14px;
      border-top: 1px solid var(--ml-assistant-border, #dfe3ea);
      background: var(--ml-assistant-card-bg, #ffffff);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .mm-chatbot-input-helpers {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      align-items: center;
    }

    .mm-chat-helper-btn {
      padding: 4px 9px;
      border-radius: 6px;
      border: 1px solid var(--ml-assistant-border, #dfe3ea);
      background: var(--ml-assistant-card-bg, #ffffff);
      color: var(--ml-assistant-muted, #5d6b80);
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .mm-chat-helper-btn:hover {
      border-color: #cbd5e1;
      color: var(--ml-assistant-text, #253041);
      background: var(--ml-assistant-panel-bg, #f8fafc);
    }

    .mm-chatbot-clear-btn {
      padding: 4px 9px;
      border-radius: 6px;
      border: 1px solid rgba(163, 61, 77, 0.2);
      background: #ffffff;
      color: var(--ml-assistant-error-text, #a33d4d);
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
      margin-left: 4px;
      flex: 0 0 auto;
      white-space: nowrap;
      scroll-snap-align: end;
    }

    .mm-chatbot-clear-btn:hover {
      background: #fff1f1;
      border-color: rgba(163, 61, 77, 0.4);
    }

    .mm-chatbot-input-row {
      display: flex;
      gap: 8px;
      align-items: flex-end;
      min-width: 0;
    }

    .mm-chatbot-add-file-btn {
      width: 38px;
      height: 38px;
      flex: 0 0 38px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--ml-assistant-border, #dfe3ea);
      border-radius: 8px;
      background: #fff;
      color: #475569;
      font-size: 22px;
      line-height: 1;
      cursor: pointer;
    }

    .mm-chatbot-add-file-btn:hover,
    .mm-chatbot-add-file-btn:focus-visible {
      border-color: var(--ml-assistant-accent, #6d7cff);
      color: #4338ca;
      background: #f5f6ff;
    }

    .mm-chatbot-textarea {
      flex: 1;
      min-width: 0;
      background: #ffffff;
      border: 1px solid var(--ml-assistant-border, #dfe3ea);
      border-radius: 8px;
      color: var(--ml-assistant-text, #253041);
      font-size: 12px;
      padding: 9px 12px;
      resize: none;
      outline: none;
      font-family: inherit;
      line-height: 1.45;
      max-height: 120px;
      min-height: 38px;
      box-sizing: border-box;
      transition: border-color 0.15s, box-shadow 0.15s;
    }

    .mm-chatbot-textarea:focus {
      border-color: var(--ml-assistant-accent, #6d7cff);
      box-shadow: 0 0 0 3px rgba(109, 124, 255, 0.16);
    }

    .mm-chatbot-textarea::placeholder {
      color: #94a3b8;
    }

    /* Send button matching .ml-assistant-cta-button */
    .mm-chatbot-send-btn {
      width: 38px;
      height: 38px;
      border-radius: 8px;
      border: 1px solid var(--ml-assistant-accent, #6d7cff);
      background: var(--ml-assistant-accent, #6d7cff);
      color: #ffffff;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
      flex-shrink: 0;
      box-shadow: 0 1px 2px rgba(109, 124, 255, 0.2);
    }

    .mm-chatbot-send-btn:hover:not(:disabled) {
      background: #5b6aff;
      border-color: #5b6aff;
      box-shadow: 0 2px 4px rgba(109, 124, 255, 0.3);
    }

    .mm-chatbot-send-btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
      box-shadow: none;
    }

    .mm-chatbot-send-btn.gemini-mode {
      background: #2563eb;
      border-color: #2563eb;
    }

    .mm-chatbot-send-btn.gemini-mode:hover:not(:disabled) {
      background: #1d4ed8;
      border-color: #1d4ed8;
    }

    /* Model Advisor inspired refinement: clearer hierarchy, spacing, and action affordances. */
    .mm-chatbot-root {
      background: #f4f6fb;
      color: #25324a;
    }

    .mm-chatbot-header {
      padding: 11px 16px 10px;
      gap: 7px;
      background: #fff;
      box-shadow: 0 2px 8px rgba(28, 39, 72, 0.035);
      z-index: 1;
    }

    .mm-chatbot-title {
      font-size: 16px;
      letter-spacing: -0.02em;
    }

    .mm-chatbot-title-icon {
      display: inline-flex;
      width: 30px;
      height: 30px;
      align-items: center;
      justify-content: center;
      border-radius: 9px;
      background: #eeedff;
      color: #5145cd;
      font-size: 16px;
    }

    .mm-chatbot-provider-switch {
      padding: 4px;
      border-radius: 10px;
      background: #f5f6fb;
    }

    .mm-chatbot-provider-btn {
      min-height: 32px;
      padding: 6px 11px;
      font-size: 12px;
      border-radius: 7px;
    }

    .mm-chatbot-status-pill {
      padding: 4px 9px;
      font-size: 11px;
      background: #e9f8f0;
      color: #17764d;
      border-color: #d4f0e1;
    }

    .mm-chatbot-context-bar {
      min-height: 0;
      margin-left: auto;
      padding: 0;
      background: transparent;
      font-size: 11px;
      white-space: nowrap;
    }

    .mm-chatbot-context-bar > span:first-child { color: #6a778d; }

    .mm-chatbot-status-bar {
      justify-content: flex-start;
      gap: 7px;
      min-height: 30px;
    }

    .mm-chatbot-context-chip {
      min-height: 28px;
      padding: 4px 10px;
      font-size: 11.5px;
      border-radius: 7px;
    }

    .mm-chatbot-messages {
      padding: 18px 20px;
      gap: 18px;
      background:
        radial-gradient(ellipse at 10% 0%, rgba(109, 91, 230, 0.035), transparent 38%),
        #f4f6fb;
    }

    .mm-chat-msg { gap: 10px; }
    .mm-chat-avatar { width: 32px; height: 32px; font-size: 15px; }
    .mm-chat-bubble-container { gap: 5px; }
    .mm-chat-bubble-header { font-size: 11px; padding-inline: 4px; }
    .mm-chat-sender-name { font-size: 12px; }
    .mm-chat-provider-badge { padding: 2px 7px; font-size: 10px; }

    .mm-chat-msg-user .mm-chat-bubble-container {
      max-width: min(86%, 720px);
    }

    .mm-chat-bubble {
      padding: 14px 16px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.7;
    }

    .mm-chat-bubble-user {
      background: #eeedff;
      border-color: #dcd9ff;
      border-top-right-radius: 4px;
      color: #282451;
    }

    .mm-chat-bubble-assistant {
      border-color: #e1e6ef;
      border-left: 3px solid #7062e8;
      border-top-left-radius: 4px;
      box-shadow: 0 3px 12px rgba(26, 39, 73, 0.055);
    }

    .mm-chat-bubble-error {
      border-left-color: #d44f5d !important;
    }

    .mm-chat-msg-content { gap: 11px; }
    .mm-chat-text-seg {
      margin: 0;
      color: #35435a;
      font-size: 14px;
      line-height: 1.72;
    }

    .mm-chat-text-seg strong { color: #1b2940; }
    .mm-chat-text-seg em { color: #5145cd; }

    .mm-chat-heading {
      margin: 5px 0 0;
      color: #202d45;
      font-size: 15px;
      line-height: 1.4;
      font-weight: 750;
      letter-spacing: -0.01em;
    }

    .mm-chat-heading:first-child { margin-top: 0; }
    .mm-chat-heading + .mm-chat-text-seg { margin-top: -4px; }

    .mm-chat-list {
      margin: -2px 0 0;
      padding-left: 23px;
      color: #35435a;
      font-size: 14px;
      line-height: 1.7;
    }

    .mm-chat-list li { padding-left: 3px; margin: 5px 0; }
    .mm-chat-list li::marker { color: #6256d7; font-weight: 700; }

    .mm-chat-inline-code {
      padding: 2px 6px;
      border-radius: 5px;
      background: #f1f3f9;
      border-color: #e1e5ee;
      color: #352f7c;
      font-size: 0.9em;
    }

    .mm-chat-code-block {
      margin: 3px 0;
      border-radius: 10px;
      border-color: #d5dce8;
      box-shadow: 0 3px 10px rgba(16, 24, 40, 0.12);
    }

    .mm-chat-code-lang {
      min-height: 35px;
      padding: 5px 11px;
      background: #f7f8fc;
    }

    .mm-chat-code-lang span { font-size: 10.5px; letter-spacing: 0.7px; }

    .mm-chat-copy-btn {
      padding: 4px 9px;
      border-radius: 6px;
      font-size: 11px;
    }

    .mm-chat-code-block pre {
      max-height: 460px;
      padding: 14px 16px;
    }

    .mm-chat-code-block code {
      font-size: 12.5px;
      line-height: 1.62;
    }

    .mm-chat-welcome {
      gap: 13px;
      padding: 30px 24px;
      border-radius: 15px;
      border-color: #e1e6ef;
      box-shadow: 0 5px 20px rgba(26, 39, 73, 0.055);
    }

    .mm-chat-welcome-icon {
      width: 62px;
      height: 62px;
      background: linear-gradient(140deg, #eeedff, #e9f7f1);
    }

    .mm-chat-welcome-title { font-size: 18px; }
    .mm-chat-welcome-sub { max-width: 340px; font-size: 13px; line-height: 1.65; }
    .mm-chat-suggestions { gap: 8px; margin-top: 7px; }

    .mm-chat-suggestion-chip {
      padding: 10px 13px;
      border-radius: 9px;
      background: #f9faff;
      font-size: 12px;
    }

    .mm-chatbot-input-area {
      padding: 11px 16px 14px;
      gap: 10px;
      background: #fff;
      box-shadow: 0 -3px 12px rgba(28, 39, 72, 0.035);
    }

    .mm-chatbot-input-helpers {
      gap: 7px;
      flex-wrap: nowrap;
      overflow-x: auto;
      overflow-y: hidden;
      padding: 2px 2px 7px;
      cursor: grab;
      user-select: none;
      touch-action: pan-x;
      scrollbar-width: thin;
      scrollbar-color: #c8cde0 transparent;
      scroll-snap-type: x proximity;
      overscroll-behavior-x: contain;
    }

    .mm-chatbot-input-helpers::-webkit-scrollbar { height: 5px; }
    .mm-chatbot-input-helpers::-webkit-scrollbar-track { background: #f0f2f8; border-radius: 99px; }
    .mm-chatbot-input-helpers::-webkit-scrollbar-thumb { background: #c8cde0; border-radius: 99px; }
    .mm-chatbot-input-helpers::-webkit-scrollbar-thumb:hover { background: #aeb5cd; }
    .mm-chatbot-input-helpers.is-dragging { cursor: grabbing; scroll-snap-type: none; }

    .mm-chat-helper-btn {
      min-height: 32px;
      padding: 6px 10px;
      flex: 0 0 auto;
      border-radius: 7px;
      background: #fff;
      color: #4e5c72;
      font-size: 11.5px;
      font-weight: 600;
      white-space: nowrap;
      scroll-snap-align: start;
    }

    .mm-chat-helper-btn:hover {
      border-color: #c9c4ff;
      color: #4c42c2;
      background: #f4f3ff;
      transform: translateY(-1px);
    }

    .mm-chatbot-add-file-btn,
    .mm-chatbot-send-btn { width: 42px; height: 42px; flex-basis: 42px; border-radius: 10px; }
    .mm-chatbot-textarea {
      min-height: 42px;
      padding: 10px 13px;
      border-radius: 10px;
      font-size: 13px;
      line-height: 1.5;
    }

    .mm-chatbot-textarea:focus {
      box-shadow: 0 0 0 3px rgba(109, 91, 230, 0.13);
    }

    .mm-chatbot-send-btn {
      background: #594de0;
      border-color: #594de0;
      box-shadow: 0 2px 6px rgba(89, 77, 224, 0.2);
    }

    .mm-chatbot-send-btn:hover:not(:disabled) {
      background: #493fc5;
      border-color: #493fc5;
    }

    .mm-chatbot-root button:focus-visible,
    .mm-chatbot-root textarea:focus-visible {
      outline: 3px solid rgba(89, 77, 224, 0.22);
      outline-offset: 2px;
    }

    @media (prefers-reduced-motion: reduce) {
      .mm-chatbot-root *, .mm-chatbot-root *::before, .mm-chatbot-root *::after {
        scroll-behavior: auto !important;
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }

    @container mm-chatbot (max-width: 380px) {
      .mm-chatbot-header { padding-inline: 10px; }
      .mm-chatbot-title-row { align-items: flex-start; gap: 7px; }
      .mm-chatbot-title {
        flex: 0 1 92px;
        align-items: flex-start;
        line-height: 1.08;
      }
      .mm-chatbot-provider-switch { flex: 1 1 auto; gap: 3px; }
      .mm-chatbot-provider-btn {
        flex: 1 1 0;
        justify-content: center;
        padding: 5px 6px;
        white-space: nowrap;
      }
      .mm-chatbot-context-bar { margin-left: 0; padding: 0; }
      .mm-chatbot-messages { padding: 10px; }
      .mm-chatbot-input-area { padding-inline: 10px; }
      .mm-chatbot-input-helpers { gap: 5px; }
      .mm-chat-helper-btn { flex: 0 0 auto; padding-inline: 7px; }
      .mm-chatbot-clear-btn { margin-left: 4px; }
      .mm-chat-bubble { padding: 11px 12px; font-size: 13px; }
      .mm-chat-text-seg, .mm-chat-list { font-size: 13px; }
      .mm-chat-msg-user .mm-chat-bubble-container { max-width: 90%; }
      .mm-chatbot-add-file-btn, .mm-chatbot-send-btn { width: 38px; height: 38px; flex-basis: 38px; }
    }
  `,document.head.appendChild(l);let d=[],c="ollama",m=!1,p=null,u="",h=[],g=document.createElement("div");g.className="mm-chatbot-root";let b=document.createElement("div");b.className="mm-chatbot-header";let x=document.createElement("div");x.className="mm-chatbot-title-row";let _=document.createElement("div");_.className="mm-chatbot-title",_.innerHTML='<span class="mm-chatbot-title-icon">\uD83D\uDCAC</span> AI Chatbot';let v=document.createElement("div");v.className="mm-chatbot-provider-switch";let y=document.createElement("button");y.className="mm-chatbot-provider-btn active-ollama",y.title="Use local Ollama (offline, private)",y.textContent="\uD83E\uDD99 Ollama";let w=document.createElement("button");w.className="mm-chatbot-provider-btn",w.title="Switch to Google Gemini (cloud)",w.textContent="✨ Gemini",v.append(y,w),x.append(_,v);let C=document.createElement("div");C.className="mm-chatbot-status-bar";let k=document.createElement("span");k.className="mm-chatbot-status-pill",k.innerHTML='<span class="mm-chatbot-status-dot"></span> Ollama (Local AI)';let E=document.createElement("span");E.className="mm-chatbot-status-pill",E.innerHTML='<span class="mm-chatbot-status-dot"></span> Gemini (Cloud AI)',C.append(k,E),b.append(x,C);let $=document.createElement("div");$.className="mm-chatbot-context-bar",$.innerHTML="<span>Context:</span>";let T=document.createElement("button");T.className="mm-chatbot-context-chip",T.title="Paste active cell code into your message",T.innerHTML="\uD83D\uDCCB Active Cell";let S=document.createElement("button");S.className="mm-chatbot-context-chip",S.style.display="none",S.title="Paste last error into your message",S.innerHTML="\uD83D\uDC1E Last Error",$.append(T,S),C.appendChild($);let N=document.createElement("div");N.className="mm-chatbot-messages";let M=document.createElement("div");M.className="mm-chat-welcome",M.innerHTML=`
    <div class="mm-chat-welcome-icon">🤖</div>
    <div class="mm-chat-welcome-title">ModelMind AI Chatbot</div>
    <div class="mm-chat-welcome-sub">Ask me anything — code explanations, debugging help, ML concepts, or anything Python.</div>
  `;let A=document.createElement("div");A.className="mm-chat-suggestions",["\uD83D\uDCA1 Explain active cell code","\uD83D\uDC1E How to fix the latest error?","\uD83D\uDCCA How to visualize data with matplotlib?","⚡ Optimize my code performance","\uD83E\uDD16 Recommend best ML model for my data"].forEach(e=>{let n=document.createElement("button");n.className="mm-chat-suggestion-chip",n.textContent=e,n.addEventListener("click",()=>{let n=e.replace(/^[^\s]+\s/,"");if(e.includes("active cell")){let e=u||t();e&&(n=`Explain this code:
\`\`\`python
${e}
\`\`\``)}else if(e.includes("latest error")){let e=a();e&&(n=`How do I fix this error?
${e.error_type}: ${e.error_message}
\`\`\`python
${e.code||""}
\`\`\``)}eo.value=n,eo.dispatchEvent(new Event("input")),eu()}),A.appendChild(n)}),M.appendChild(A),N.appendChild(M);let L=document.createElement("div");L.className="mm-chatbot-input-area";let z=document.createElement("div");z.className="mm-chatbot-input-helpers",z.tabIndex=0,z.setAttribute("role","toolbar"),z.setAttribute("aria-label","Chat tools. Scroll horizontally to see more actions.");let P=0,F=0,R=!1,I=!1,j=!1;z.addEventListener("pointerdown",e=>{0===e.button&&(P=e.clientX,F=z.scrollLeft,R=!0,I=!1)}),z.addEventListener("pointermove",e=>{if(!R)return;let t=e.clientX-P;Math.abs(t)>5&&(I=!0,z.hasPointerCapture(e.pointerId)||z.setPointerCapture(e.pointerId),z.classList.add("is-dragging"),z.scrollLeft=F-t)});let q=()=>{R&&(R=!1,z.classList.remove("is-dragging"),I&&(j=!0,window.setTimeout(()=>{j=!1},450)))};z.addEventListener("pointerup",q),z.addEventListener("pointercancel",q),z.addEventListener("click",e=>{j&&(e.preventDefault(),e.stopImmediatePropagation(),j=!1)},!0),z.addEventListener("wheel",e=>{Math.abs(e.deltaY)<=Math.abs(e.deltaX)||(z.scrollLeft+=e.deltaY,e.preventDefault())},{passive:!1});let D=document.createElement("input");D.type="file",D.accept=".csv,text/csv",D.style.display="none";let V=document.createElement("input");function W(e,t){let a={role:"assistant",timestamp:new Date,isError:!0,content:e instanceof Error?e.message:t};d.push(a),ep(a)}async function J(e){try{if(e.size>0xa00000)throw Error("CSV is larger than 10 MB. Please use a smaller file for chat analysis.");let t=function(e,t){let a=[],n=[],i="",r=!1;for(let t=0;t<e.length;t++){let s=e[t];r&&'"'===s&&'"'===e[t+1]?(i+='"',t++):'"'===s?r=!r:","!==s||r?"\n"!==s&&"\r"!==s||r?i+=s:("\r"===s&&"\n"===e[t+1]&&t++,n.push(i),n.some(e=>e.trim())&&a.push(n),n=[],i=""):(n.push(i),i="")}if((i||n.length)&&(n.push(i),a.push(n)),a.length<2)throw Error("This CSV needs a header and at least one data row.");let s=a[0].length,o=a[0].map((e,t)=>e.trim()||`Column ${t+1}`).slice(0,40),l=a.slice(1,20001).map(e=>o.map((t,a)=>{var n;return(null!=(n=e[a])?n:"").trim()})),d=o.map((e,t)=>{let a=l.map(e=>e[t]),n=a.filter(e=>""!==e&&!/^(na|n\/a|null|nan)$/i.test(e)),i=n.map(Number),r=n.length>0&&i.every(Number.isFinite),s=new Map;n.forEach(e=>{var t;return s.set(e,(null!=(t=s.get(e))?t:0)+1)});let o={name:e,type:r?"numeric":"categorical",missing:a.length-n.length,unique:s.size};if(!r)return{...o,categories:[...s].map(([e,t])=>({label:e.slice(0,80),count:t})).sort((e,t)=>t.count-e.count).slice(0,8)};let d=[...i].sort((e,t)=>e-t),c=i.reduce((e,t)=>e+t,0)/i.length,m=Math.sqrt(i.reduce((e,t)=>e+(t-c)**2,0)/i.length),p=m?i.reduce((e,t)=>e+((t-c)/m)**3,0)/i.length:0,u=d[0],f=d[d.length-1],h=Array(12).fill(0);i.forEach(e=>h[f===u?0:Math.min(11,Math.floor((e-u)/(f-u)*12))]++);let g=d.length%2?d[(d.length-1)/2]:(d[d.length/2-1]+d[d.length/2])/2,b=d[Math.floor((d.length-1)*.25)],x=d[Math.floor((d.length-1)*.75)],_=b-1.5*(x-b),v=x+1.5*(x-b),y=i.filter(e=>e<_||e>v).length;return{...o,mean:+c.toPrecision(5),median:+g.toPrecision(5),std:+m.toPrecision(5),skewness:+p.toPrecision(4),min:u,max:f,outliers:y,histogram:h}}),c=new Set,m=0;return l.forEach(e=>{let t=JSON.stringify(e);c.has(t)&&m++,c.add(t)}),{filename:t,rows:a.length-1,profiledRows:l.length,totalColumns:s,columns:d,duplicateRows:m}}(await e.text(),e.name);p=t;let a=t.columns.slice(0,20).map(e=>"numeric"===e.type?`${e.name}: numeric, mean ${e.mean}, median ${e.median}, skewness ${e.skewness}, missing ${e.missing}`:`${e.name}: categorical, ${e.unique} unique values, missing ${e.missing}`).join("\n"),n={role:"assistant",timestamp:new Date,datasetProfile:t,content:`I analyzed **${t.filename}** locally. The profile includes numeric distributions, skewness, missing values, category frequencies, and duplicate rows.

${a}`};if(d.push(n),ep(n),"ollama"===c)eo.value="Explain the main patterns in this CSV profile, including distributions, skewness, missing data, category balance, duplicates, unusual values, and practical next steps. Cite the measured values and clearly identify any sample-based results.",eu();else{let e={role:"assistant",timestamp:new Date,content:"The CSV profile stays local. Switch the provider to Ollama and ask for an explanation to get a model interpretation of these measurements."};d.push(e),ep(e)}}catch(e){W(e,"Could not analyze this CSV.")}}async function K(e){var t;try{if(e.size>102400)throw Error("Code file is larger than 100 KB. Please choose a smaller file.");let a=await e.text();e.name.toLowerCase().endsWith(".ipynb")&&(a=(null!=(t=JSON.parse(a).cells)?t:[]).filter(e=>"code"===e.cell_type).map(e=>{var t;return Array.isArray(e.source)?e.source.join(""):null!=(t=e.source)?t:""}).join("\n\n")),u=a.slice(0,3e3);let n={role:"assistant",timestamp:new Date,content:`Loaded **${e.name}** (${a.split(/\r?\n/).length} lines). Use **Explain Code** or ask a question. The file stays on this computer; the selected chat provider receives only the first 3,000 characters when you send a message.`};d.push(n),ep(n)}catch(e){W(e,"Could not read this code file.")}}V.type="file",V.accept=".py,.ipynb,.js,.ts,.jsx,.tsx,.java,.c,.cpp,.go,.rs,.txt,.json,text/plain,application/json",V.style.display="none";let Q=document.createElement("button");Q.className="mm-chat-helper-btn",Q.textContent="\uD83D\uDCCA Analyze CSV",Q.addEventListener("click",()=>D.click()),D.addEventListener("change",async()=>{var e;let t=null==(e=D.files)?void 0:e[0];D.value="",t&&await J(t)}),z.append(Q,D);let Y=document.createElement("button");Y.className="mm-chat-helper-btn",Y.textContent="\uD83E\uDDE9 Upload Code",Y.addEventListener("click",()=>V.click()),V.addEventListener("change",async()=>{var e;let t=null==(e=V.files)?void 0:e[0];V.value="",t&&await K(t)}),z.append(Y,V),[{icon:"\uD83C\uDF33",label:"Visualize Tree",action:async()=>{let e={role:"assistant",timestamp:new Date,provider:c,content:"Reading fitted scikit-learn decision trees from the current notebook kernel…"};d.push(e);let a=ep(e);try{let t=await i();e.decisionTrees=t,e.content=t.length?`Found ${t.length} fitted decision tree${1===t.length?"":"s"} in the current kernel. This view is built from the fitted model.`:"No fitted scikit-learn decision tree was found in the current notebook kernel."}catch(t){e.isError=!0,e.content=t instanceof Error?t.message:"Could not inspect fitted decision trees."}a.replaceWith(X(e,n,t,i,r,o)),N.scrollTop=N.scrollHeight}},{icon:"\uD83E\uDDE0",label:"Visualize Neural Network",action:async()=>{let e={role:"assistant",timestamp:new Date,provider:c,content:"Reading fitted scikit-learn MLP networks from the current notebook kernel…"};d.push(e);let a=ep(e);try{let t=await r();e.neuralNetworks=t,e.content=t.length?`Found ${t.length} fitted neural network${1===t.length?"":"s"} in the current kernel. The diagram shows the learned layer structure and weights.`:"No fitted scikit-learn MLP neural network was found in the current notebook kernel."}catch(t){e.isError=!0,e.content=t instanceof Error?t.message:"Could not inspect fitted neural networks."}a.replaceWith(X(e,n,t,i,r,o)),N.scrollTop=N.scrollHeight}},{icon:"\uD83C\uDFCB",label:"Train ML Model",action:async()=>{let e={role:"assistant",timestamp:new Date,provider:c,content:"Checking the active notebook for prepared training data…"};d.push(e);let a=ep(e);try{e.trainingSources=await s(),e.content=e.trainingSources.length?`Found ${e.trainingSources.length} prepared feature/target pair${1===e.trainingSources.length?"":"s"}. Choose a model to train locally.`:"No prepared feature/target pair was found in the active kernel."}catch(t){e.isError=!0,e.content=t instanceof Error?t.message:"Could not inspect training data in the notebook kernel."}a.replaceWith(X(e,n,t,i,r,o)),N.scrollTop=N.scrollHeight}},{icon:"\uD83D\uDD0E",label:"Visualize Code",action:()=>{let e,a=t().trim()||u.trim();if(!a)return void W(Error("Select a code cell or upload a code file first."),"Select a code cell or upload a code file first.");let n={...function(e){var t,a,n;let i,r,s,o=e.slice(0,3e3),l=o.match(/\bMLP(?:Classifier|Regressor)\b/);if(l){let e=function(e){var t,a;if(!e)return[];let n=null!=(a=null==(t=e.match(/\d+/g))?void 0:t.map(Number))?a:[];return n.length&&n.every(e=>Number.isSafeInteger(e)&&e>0)?n.slice(0,5):[]}(B(o,"hidden_layer_sizes")),t=[{label:"Input features",units:null},...e.length?e.map((e,t)=>({label:`Hidden ${t+1}`,units:e})):[{label:"Hidden layer(s)",units:null}],{label:"Output",units:null}];return{kind:"neural-network",title:"Neural-network architecture in source",summary:`${l[0]} is declared in this cell. The diagram shows layer flow; the input/output widths are unknown unless the fitted model is inspected.`,layers:t,steps:[{title:"Source declaration",detail:`${l[0]} appears in the selected code.`,line:H(o,/\bMLP(?:Classifier|Regressor)\b/)}],sourceFacts:[`${l[0]} is named in the selected source.`,...e.length?[`The literal hidden_layer_sizes setting is (${e.join(", ")}).`]:[]],limits:["This source preview does not show fitted weights, activations, predictions, or measured accuracy."],sourceNote:e.length?`Hidden-layer sizes ${e.join(" → ")} were read from the literal hidden_layer_sizes setting. No weights, learned activations, or predictions are shown.`:"No literal hidden_layer_sizes value was found. Layer widths, learned weights, activations, and predictions are not shown."}}if(/\bDecisionTree(?:Classifier|Regressor)\b/.test(o)){let e=/\bDecisionTreeRegressor\b/.test(o);return{kind:"decision-tree",title:"Decision-tree concept in source",summary:`The code declares a ${e?"regression":"classification"} decision tree.`,steps:[{title:"Input features",detail:"The estimator receives feature rows when fit or predict is called."},{title:"Feature test",detail:"A fitted tree learns a feature and threshold for each split; this source preview does not invent either."},{title:e?"Numeric estimate":"Class decision",detail:"A leaf returns the learned value or class after the fitted path is followed."}],sourceFacts:[`The selected source names a ${e?"DecisionTreeRegressor":"DecisionTreeClassifier"}.`],limits:["The diagram is conceptual; learned feature tests, thresholds, branches, and leaf values require a fitted-model inspection."],sourceNote:"Branch structure is conceptual. For real split names, thresholds, samples, and leaf outputs, use Visualize Tree after fitting the model in the notebook kernel."}}if(/\bKMeans\b/.test(o)){let e=function(e){if(!e)return null;let t=e.match(/^\(?\s*(\d+)\s*\)?$/);if(!t)return null;let a=Number(t[1]);return Number.isSafeInteger(a)&&a>0?a:null}(B(o,"n_clusters"));return{kind:"clustering",title:"K-means workflow in source",summary:null===e?"The code references KMeans; the number of clusters is not a visible positive integer literal.":`The source sets n_clusters=${e}. This is a configured value, not a measured cluster result.`,steps:[{title:"Feature rows",detail:"KMeans receives numeric observations as input."},{title:null===e?"Choose k":`Initialize ${e} centroids`,detail:"Centroid positions depend on the data and initialization at fit time."},{title:"Assign points",detail:"Each row is assigned to its nearest current centroid."},{title:"Update and repeat",detail:"Centroids are recomputed until the stopping rule is met."}],sourceFacts:["The selected source references KMeans.",...null===e?[]:[`The source sets n_clusters=${e}; this is configuration, not a measured result.`]],limits:["No centroids, assignments, cluster sizes, or inertia are calculated by this preview."],sourceNote:"No points, centroid positions, labels, or inertia are computed by this static preview."}}if(/\bPCA\b/.test(o)&&!/\b(?:Pipeline|ColumnTransformer)\s*\(/.test(o)){let e=B(o,"n_components");return{kind:"dimensionality-reduction",title:"PCA workflow in source",summary:"The selected code references principal-component analysis.",steps:[{title:"Feature matrix",detail:"PCA operates on numeric feature columns."},.../\b(?:StandardScaler|RobustScaler|MinMaxScaler)\b/.test(o)?[{title:"Scale features",detail:"A scaler is also referenced in the selected source; whether it runs before PCA depends on the code path."}]:[],{title:"Find components",detail:e?`The source sets n_components=${e}; inspect the fitted object for the realized component count.`:"Principal directions are learned from the fitted input data."},{title:"Project rows",detail:"Rows are represented in the selected component space when transform is called."}],sourceFacts:["The selected source references PCA.",...e?[`The source sets n_components=${e}.`]:[]],limits:["No fitted components, explained variance, loadings, or projected rows are calculated by this preview."],sourceNote:"No explained-variance values, component loadings, or transformed rows are fabricated; those require fitting and inspecting the estimator."}}if(/\b(?:Pipeline|ColumnTransformer)\s*\(/.test(o)){let e=function(e){let t,a=e=>{let t,a=[],n=/\(\s*['"]([^'"]+)['"]\s*,/g;for(;(t=n.exec(e))&&a.length<7;)a.push(t[1]);return a},n=e.match(/transformers\s*=\s*\[([\s\S]*?)\]/),i=n?a(n[1]):[],r=[],s=/steps\s*=\s*\[([\s\S]*?)\]/g;for(;(t=s.exec(e))&&r.length<7;)r.push(...a(t[1]).slice(0,7-r.length));let o=[...i,...r];return o.length?o.slice(0,7):a(e).slice(0,7)}(o),t=[],a=[];e.length&&t.push(`Named source stages, in branch-to-step order: ${e.join(" → ")}.`);let n=/\bColumnTransformer\s*\(/.test(o)?o.match(/\(\s*['"]([^'"]+)['"]\s*,\s*([A-Za-z_]\w*)\s*,\s*\[([^\]]*)\]\s*\)/):null;if(n){let e,a=[],i=/['"]([^'"]+)['"]/g;for(;null!==(e=i.exec(n[3]));)a.push(e[1]);a.length&&t.push(`ColumnTransformer branch "${n[1]}" routes ${a.map(e=>`"${e}"`).join(", ")} through "${n[2]}".`)}/\bPCA\s*\(/.test(o)&&t.push("PCA is configured as a source stage; the named stage list preserves the order visible in the pipeline declaration.");let i=o.match(/\btrain_test_split\s*\(([^\n)]*)\)/);if(i){let e=H(o,/\btrain_test_split\s*\(/);t.push(`${e?`Line ${e}: `:""}train_test_split(${i[1].trim()}) partitions inputs; it does not itself evaluate a model.`)}/\.fit_transform\s*\(\s*X_train\s*\)/.test(o)&&t.push("The source calls preprocessor.fit_transform(X_train), which fits the preprocessing steps on the training input and transforms it when executed."),/\.transform\s*\(\s*X_test\s*\)/.test(o)&&t.push("The source calls preprocessor.transform(X_test), applying the already-fitted preprocessing steps to the test input when executed."),/\bStandardScaler\s*\(/.test(o)&&t.push("StandardScaler is configured; when fit, it centers and scales using statistics learned from its fit input. It does not remove skewness."),/\bPowerTransformer\b/.test(o)&&!/\bPowerTransformer\s*\(/.test(o)&&t.push("PowerTransformer appears in an import but is not configured as a pipeline step in this source."),/\b(?:cross_val_score|accuracy_score|balanced_accuracy_score|mean_squared_error|classification_report)\s*\(|\.predict(?:_proba)?\s*\(|\.score\s*\(/.test(o)||a.push("No prediction or model-evaluation metric is computed in this cell."),/missing|null|isna/i.test(o)&&!/\.(?:isna|isnull)\s*\(/.test(o)&&a.push("A missing-value comment or label is not a measured missing-value check in this source."),a.push("This preview does not read the CSV or calculate transformed values.");let r=e.length?e.map(e=>{let t;return{title:e,detail:"Stage label read from a source tuple; outer column-transformer branches appear before nested pipeline steps.",line:(t=e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),H(o,RegExp(`[\\"']${t}[\\"']\\s*,`)))}}):[{title:"Input columns",detail:"The transformer receives the selected feature columns."},{title:"Transform stages",detail:"Configured transformers run in the order defined by the source."},{title:"Estimator",detail:"A final estimator consumes the transformed feature matrix when the pipeline is fit or called."}];return{kind:"pipeline",title:"Preprocessing pipeline in source",summary:e.length?`Found ${e.length} named stage label(s) in the pipeline/transformer source. Pipeline steps follow source order; ColumnTransformer branches are shown as routing branches.`:"The cell declares a scikit-learn pipeline or column transformer.",steps:r,sourceFacts:t.length?t:["A scikit-learn Pipeline or ColumnTransformer is declared in the selected source."],limits:a,sourceNote:"Pipeline step labels follow their source order. ColumnTransformer labels describe parallel column-routing branches, not a sequential order. This preview does not fit transformers, expose learned statistics, or prove that the pipeline is leakage-free."}}let d=[...O].sort((e,t)=>t.patterns.length-e.patterns.length).find(e=>e.requireAllPatterns?e.patterns.every(e=>e.test(o)):e.patterns.some(e=>e.test(o)));if(d){let e=d.patterns.find(e=>e.test(o)),i=e&&null!=(n=null==(a=null==(t=o.match(e))?void 0:t[0])?void 0:a.replace(/\s*\($/,""))?n:d.name;return{kind:"algorithm",title:`${d.name} concept in source`,summary:`The selected source references ${i}. The steps below describe the algorithm at a high level; they are not a record of this cell's execution.`,category:d.category,steps:d.process.map((t,a)=>{var n;return{title:null!=(n=["Input or configuration","Fit or transform","Prediction or result"][a])?n:`Algorithm step ${a+1}`,detail:t,line:e?H(o,e):void 0}}),sourceFacts:[`The selected source references ${i}.`,`ModelMind categorizes this visualization as ${d.category}.`],limits:d.limits,sourceNote:"This conceptual view is based on estimator or algorithm names in the selected source. It does not show fitted parameters, dataset-specific behavior, or measured performance."}}return i=o.split(/\r?\n/),r=[],i.forEach((e,t)=>{let a=e.trim();if(!a||a.startsWith("#"))return;let n="Python statement",i="The expression is evaluated in the current program state.";/^(?:from\s+\S+\s+import|import)\b/.test(a)?(n="Load dependency",i="Makes a module or selected names available to later code."):/^(?:async\s+)?def\s+/.test(a)?(n="Define function",i="Creates a reusable function; its body runs when the function is called."):/^class\s+/.test(a)?(n="Define class",i="Declares a type and its behavior; instances are created separately."):/^(?:if|elif|else|try|except|finally)\b/.test(a)?(n="Choose a path",i="The runtime condition or outcome determines which indented block runs."):/^(?:for|while|async\s+for)\b/.test(a)?(n="Repeat a block",i="The indented body may run repeatedly; the actual number of passes depends on runtime values."):/\.(?:read_csv|read_parquet|read_excel)\s*\(/.test(a)||/\bread_csv\s*\(/.test(a)?(n="Load data",i="Reads a table from the source named in this call; the file contents are not inspected here."):/\.(?:fit|fit_transform)\s*\(/.test(a)?(n="Fit / learn",i="Requests that the estimator or transformer learn from the supplied data."):/\.(?:predict|predict_proba)\s*\(/.test(a)?(n="Predict",i="Requests predictions from the estimator; no prediction is computed by this preview."):/\.(?:transform|impute|scale|encode)\s*\(/.test(a)?(n="Transform features",i="Applies a data-preparation step to its input."):/\.(?:plot|hist|bar|scatter|show|savefig)\s*\(/.test(a)?(n="Create visualization",i="Builds or displays a chart when the line is executed."):/^return\b/.test(a)?(n="Return value",i="Exits the current function and passes a value to its caller."):/^print\s*\(|^display\s*\(/.test(a)?(n="Show output",i="Writes a value to notebook output when the line runs."):/^[\w.\[\]]+\s*(?:[+\-*/]?=)/.test(a)&&(n="Set or update value",i="Evaluates the right-hand expression and stores it in a name or location."),r.push({title:n,detail:i,line:t+1})}),s=r.slice(0,7),r.length>s.length&&s.push({title:"More source code",detail:`${r.length-7} additional nonblank statement(s) are omitted from this compact overview.`}),s.length||s.push({title:"Selected source",detail:"This cell has no recognizable executable statements to arrange into a flow."}),{kind:"code-flow",title:"Selected-cell code flow",summary:"A static, line-ordered overview of recognizable Python statements.",steps:s,sourceFacts:r.slice(0,5).map(e=>`Line ${e.line}: ${e.title.toLowerCase()} — ${e.detail}`),limits:["This preview does not execute the cell, read local files, or compute runtime values."],sourceNote:"This is a source-code reading aid. Conditions, loop counts, values, and outputs depend on execution and are not inferred."}}(e=a.slice(0,3e3)),sourceOverlays:function(e){let t,a=e.split(/\r?\n/),n=[],i=e=>{var t,a;return null!=(a=null==(t=e.match(/^\s*/))?void 0:t[0].replace(/\t/g,"    ").length)?a:0},r=[];a.forEach((e,t)=>{var a;let n=e.trim();if(!n||n.startsWith("#"))return;let s=n.match(/^(if|elif|else|for|while|try|except|finally|with|def|async\s+def|return|break|continue)\b(.*)/);if(!s)return;let o=s[1].replace(/\s+/g," "),l=Math.min(8,Math.floor(i(e)/4));r.push({title:`${null!=(a=({if:"Condition",elif:"Alternative condition",else:"Alternate branch",for:"Loop",while:"Loop",try:"Protected block",except:"Error branch",finally:"Cleanup branch",with:"Context block",def:"Function","async def":"Async function",return:"Return",break:"Loop exit",continue:"Next iteration"})[o])?a:"Statement"}${s[2]?` \xb7 ${s[2].trim().replace(/:$/,"")}`:""}`,detail:"Read from the source line; this map does not evaluate conditions or choose a runtime path.",line:t+1,indent:l})}),r.length&&n.push({id:"C01",title:"Control-flow outline",summary:"Branch, loop, function, and exit statements in source order, nested by indentation. This is a structural outline, not an executed path.",steps:r.slice(0,24)});let s=[],o=/^[ \t]*(?:async[ \t]+)?def[ \t]+(\w+)[ \t]*\(/gm;for(;null!==(t=o.exec(e));)s.push({name:t[1],start:t.index});let l=[];s.forEach(({name:t,start:n})=>{var r;let s=e.slice(0,n).split(/\r?\n/).length,o=i(null!=(r=a[s-1])?r:""),d=a.length;for(let e=s;e<a.length;e+=1)if(a[e].trim()&&i(a[e])<=o){d=e;break}let c=a.slice(s,d).join("\n").replace(/^\s*#.*$/gm,""),m=RegExp(`\\b${t}\\s*\\(`),p=c.split(/\r?\n/).findIndex(e=>m.test(e));p>=0&&l.push({title:`${t}() calls itself`,detail:"A recursive call is present in the function body. Recursion depth, termination, and returned values depend on runtime input.",line:s+p+1})}),l.length&&n.push({id:"C05",title:"Recursive-call structure",summary:"Self-calls found by matching function names in their source bodies; no call tree is executed or inferred.",steps:l.slice(0,8)});let d=[];a.forEach((e,t)=>{/\b(?:reshape|transpose|ravel|flatten|stack|concatenate|vstack|hstack|array|asarray)\s*\(|\.shape\b/.test(e)&&!e.trim().startsWith("#")&&d.push({title:"Array or shape operation",detail:e.trim().slice(0,150),line:t+1})}),d.length&&n.push({id:"C07",title:"Array and shape operations",summary:"Source operations that create, reshape, combine, or inspect array dimensions. Actual dimensions appear only when values are inspected at runtime.",steps:d.slice(0,12)});let c=[];a.forEach((e,t)=>{/\bsorted\s*\(|\.sort\s*\(/.test(e)&&!e.trim().startsWith("#")&&c.push({title:"Sorting operation",detail:"A built-in sorted() call or in-place .sort() call appears in the source; no values are sorted by this preview.",line:t+1})}),c.length&&n.push({id:"C10",title:"Sorting source map",summary:"Sorting call sites are identified. A before/after animation requires actual input values and an explicit run.",steps:c.slice(0,8)});let m=[];a.forEach((e,t)=>{/\bbisect_(?:left|right)\s*\(|\bbinary_search\s*\(/.test(e)&&!e.trim().startsWith("#")&&m.push({title:"Binary-search operation",detail:"A bisect or explicitly named binary_search call appears in the source; the searched values and result are not evaluated here.",line:t+1})}),m.length&&n.push({id:"C11",title:"Binary-search source map",summary:"Recognized search calls are shown with their source locations; no sortedness or search result is assumed.",steps:m.slice(0,8)});let p=[];if(a.forEach((e,t)=>{/^(?:\s*)(?:for|while)\b/.test(e)&&p.push({line:t+1,depth:i(e)})}),p.length){let e=Math.max(...p.map(e=>e.depth));n.push({id:"C12",title:"Complexity cues",summary:"Static hints only. Input sizes, early exits, called functions, and runtime values are not known, so this view does not assign a Big-O bound.",steps:[{title:`${p.length} loop header(s)`,detail:e>=4?"At least one loop is nested inside another loop by source indentation; this can increase work as input grows, but does not establish a bound.":"A loop is present; its iteration count depends on its iterable or stopping condition.",line:p[0].line},...l.length?[{title:"Recursive call(s) also present",detail:"Recurrence cost cannot be established without input-size progress and a termination condition."}]:[],...c.length?[{title:"Sorting call(s) also present",detail:"Sorting cost depends on the number of elements and the selected implementation."}]:[]]})}return n}(e)};eo.value="Explain this selected Python cell to a beginner. Use exactly these three headings: “What the code shows”, “Why these steps are used”, and “What this does not establish”. Keep each section concise and tie claims to visible code. The source-based diagram is static: this request did not execute the cell. Distinguish calls written in source from results measured at runtime. Do not invent file contents, statistics, model scores, learned splits, weights, predictions, target variables, missingness, bugs, pitfalls, feature relevance, or model evaluation. Treat comments, filenames, and variable names as labels, not measurements. Explain stable library behavior accurately; for example, StandardScaler centers and scales using training-set statistics when fit, and does not remove skewness. Do not add generic workflow advice or suggestions unless I ask for them.",ed(),eu({activeCode:a,codeVisualization:n})}},{icon:"▶",label:"Animate Code",action:()=>{let e=(t().trim()||u).trim();if(!e)return void W(Error("Select a code cell or upload a code file first."),"Select a code cell or upload a code file first.");let a={role:"assistant",timestamp:new Date,provider:c,content:"Confirm Run & trace to capture the executed lines and variable values for this code.",animationCode:e,animationUsesActiveCell:!!t().trim()};d.push(a),ep(a)}},{icon:"\uD83D\uDCCB",label:"Paste Code",action:()=>{let e=u||t();e&&(eo.value+=(eo.value?"\n":"")+`\`\`\`python
${e.slice(0,3e3)}
\`\`\``,ed(),eo.focus())}},{icon:"\uD83D\uDC1E",label:"Paste Error",action:()=>{let e=a();e&&(eo.value+=(eo.value?"\n":"")+`Error: ${e.error_type}: ${e.error_message}
`+(e.traceback?`Traceback:
\`\`\`
${e.traceback.slice(0,1e3)}
\`\`\``:""),ed(),eo.focus())}},{icon:"\uD83D\uDCDD",label:"Explain Code",action:()=>{let e=u||t();e&&(eo.value=`Please explain this code in detail:
\`\`\`python
${e.slice(0,3e3)}
\`\`\``,ed(),eo.focus())}}].forEach(({icon:e,label:t,action:a})=>{let n=document.createElement("button");n.className="mm-chat-helper-btn",n.textContent=`${e} ${t}`,n.addEventListener("click",a),z.appendChild(n)});let Z="",ee="",et=document.createElement("button");et.className="mm-chat-helper-btn",et.textContent="✅ Check this answer",et.disabled=!0,et.title="Choose a practice question first",et.addEventListener("click",()=>{ef()}),z.appendChild(et);let ea=document.createElement("button");ea.className="mm-chatbot-clear-btn",ea.textContent="\uD83D\uDDD1 Clear",ea.addEventListener("click",()=>{d.length=0,h.length=0,N.replaceChildren(M)}),z.appendChild(ea);let en=document.createElement("div");en.className="mm-chatbot-input-row";let ei=document.createElement("input");ei.type="file",ei.accept=`${D.accept},${V.accept}`,ei.style.display="none",ei.setAttribute("aria-label","Choose a CSV or code file");let er=document.createElement("button");async function es(e){let t=Array.from(e);if(t.length>1)return void W(Error("Add one file at a time so I can keep each file’s analysis separate."),"Please add one file at a time.");let a=t[0];if(!a)return;let n=a.name.toLowerCase();n.endsWith(".csv")||"text/csv"===a.type?await J(a):/\.(py|ipynb|js|ts|jsx|tsx|java|c|cpp|go|rs|txt|json)$/i.test(n)||"text/plain"===a.type||"application/json"===a.type?await K(a):W(Error("Unsupported file type. Add a CSV or a code/text file such as .py, .ipynb, .js, .ts, or .txt."),"Unsupported file type.")}er.type="button",er.className="mm-chatbot-add-file-btn",er.textContent="+",er.title="Attach a CSV or code file",er.setAttribute("aria-label","Attach a CSV or code file"),er.addEventListener("click",()=>ei.click()),ei.addEventListener("change",async()=>{let e=ei.files;ei.value="",e&&await es(e)});let eo=document.createElement("textarea");eo.className="mm-chatbot-textarea",eo.placeholder="Ask anything about code, ML, or Python... (Shift+Enter for newline)",eo.rows=1;let el=document.createElement("button");function ed(){eo.style.height="auto",eo.style.height=Math.min(eo.scrollHeight,120)+"px"}function ec(e){c=e,"ollama"===e?(y.className="mm-chatbot-provider-btn active-ollama",w.className="mm-chatbot-provider-btn",k.style.borderColor="rgba(107, 33, 168, 0.4)",k.style.background="#f3e8ff",k.style.color="#6b21a8",E.style.borderColor="transparent",E.style.background="var(--ml-assistant-success-bg, #dff5eb)",E.style.color="var(--ml-assistant-success-text, #1d7b54)",el.className="mm-chatbot-send-btn"):(w.className="mm-chatbot-provider-btn active-gemini",y.className="mm-chatbot-provider-btn",E.style.borderColor="rgba(30, 64, 175, 0.4)",E.style.background="#eff6ff",E.style.color="#1e40af",k.style.borderColor="transparent",k.style.background="var(--ml-assistant-success-bg, #dff5eb)",k.style.color="var(--ml-assistant-success-text, #1d7b54)",el.className="mm-chatbot-send-btn gemini-mode")}async function em(){try{(await f("api/settings/gemini-key",e)).configured?(E.classList.remove("offline"),E.innerHTML='<span class="mm-chatbot-status-dot"></span> Gemini configured'):(E.classList.add("offline"),E.innerHTML='<span class="mm-chatbot-status-dot"></span> Gemini unconfigured')}catch(e){E.classList.add("offline"),E.innerHTML='<span class="mm-chatbot-status-dot"></span> Gemini unavailable'}try{let t=await f("api/local-ai/status",e);"connected"===t.status&&"available"===t.model_status?(k.classList.remove("offline"),k.innerHTML='<span class="mm-chatbot-status-dot"></span> Ollama (Local AI)'):(k.classList.add("offline"),k.innerHTML='<span class="mm-chatbot-status-dot"></span> Ollama offline')}catch(e){k.classList.add("offline"),k.innerHTML='<span class="mm-chatbot-status-dot"></span> Ollama offline'}ec(c)}function ep(e){let a=N.querySelector(".mm-chat-welcome");a&&a.remove();let s=X(e,n,t,i,r,o);return N.appendChild(s),N.scrollTop=N.scrollHeight,s}async function eu(a={}){var s;let l=eo.value.trim();if(!l||m)return;m=!0,el.disabled=!0,eo.value="",ed();let f={role:"user",content:l,timestamp:new Date};d.push(f),ep(f),h.push({role:"user",content:l});let g=ep({role:"assistant",content:"",provider:c,timestamp:new Date,isStreaming:!0}),b=null!=(s=a.activeCode)?s:u||t();try{let s=await U(e,{message:l,provider:c,history:h.slice(-10),context:{active_code:b.slice(0,3e3),dataset_profile:p,source_grounded_visualization:!!a.codeVisualization,source_evidence:a.codeVisualization?{facts:a.codeVisualization.sourceFacts,limits:a.codeVisualization.limits}:void 0}});if("replied"===s.status&&s.reply){let e={role:"assistant",content:s.reply,provider:s.provider||c,timestamp:new Date,codeProfile:/explain|walk through|what does this code|how does this code/i.test(l)&&b?[["Imports",/^\s*(?:import\s+|from\s+\S+\s+import\s+)/gm],["Functions",/^\s*(?:async\s+)?def\s+\w+/gm],["Classes",/^\s*class\s+\w+/gm],["Conditions",/^\s*(?:if|elif|else)\b/gm],["Loops",/^\s*(?:for|while|async\s+for)\b/gm],["Data operations",/\b(?:read_csv|groupby|merge|join|fit|predict|transform|plot|hist|bar)\s*\(/g],["Outputs",/\b(?:print|display|savefig|to_csv)\s*\(/g]].map(([e,t])=>{var a;return{label:e,count:(null!=(a=b.match(t))?a:[]).length}}):void 0,codeVisualization:a.codeVisualization,visualizationIds:Array.isArray(s.visualization_ids)?s.visualization_ids:void 0};if(!await G(g,s.reply,N))return;g.replaceWith(X(e,n,t,i,r,o)),d.push(e),h.push({role:"assistant",content:s.reply})}else{g.remove(),h.pop();let e="I could not respond right now.";"model_missing"===s.status?e="\uD83E\uDD99 Ollama model not found. Please install it first via the AI Assistant.":"ollama_unavailable"===s.status?e="\uD83E\uDD99 Ollama is not running. Start Ollama, or switch to Gemini.":"chat_unavailable"===s.status?e="\uD83E\uDD99 Ollama is running, but it could not finish this reply. Try again; shorter prompts usually respond faster.":"context_too_large"===s.status?e="This file profile is too large to send to the local model. Try a smaller CSV or ask about fewer columns.":"model_status_unavailable"===s.status?e="\uD83E\uDD99 Ollama is responding, but the selected model is not ready. Check the AI Assistant model status and try again.":"gemini_unconfigured"===s.status?e="✨ Open the \uD83D\uDD11 API Key tab in the right sidebar to save your Gemini key.":"gemini_unavailable"===s.status?e=s.message?`✨ ${s.message}`:"✨ Gemini is temporarily unavailable. Try again or switch to Ollama.":s.message&&(e=s.message);let t={role:"assistant",content:e,timestamp:new Date,isError:!0,provider:c,codeVisualization:a.codeVisualization};d.push(t),ep(t)}}catch(t){g.remove(),h.pop();let e={role:"assistant",content:"⚠️ Network error — could not reach the backend. Is the platform running?",timestamp:new Date,isError:!0,provider:c,codeVisualization:a.codeVisualization};d.push(e),ep(e)}finally{m=!1,el.disabled=!1,eo.focus()}}async function ef(){let a=(u||t()).trim();if(!Z)return;if(!a){let e={role:"assistant",content:"Write your answer or code in the active answer cell before checking it.",timestamp:new Date,isError:!0,provider:c};d.push(e),ep(e);return}if(m)return;m=!0,el.disabled=!0,et.disabled=!0;let s={role:"user",content:`Check my answer: ${ee||"practice question"}`,timestamp:new Date,provider:c};d.push(s),ep(s);let l=ep({role:"assistant",content:"",provider:c,timestamp:new Date,isStreaming:!0});try{let s=await f("api/practice/review",e,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question_id:Z,answer:a,provider:c})});if("replied"===s.status&&s.reply){let e={role:"assistant",content:s.reply,provider:"gemini"===s.provider?"gemini":c,timestamp:new Date};await G(l,s.reply,N)&&(l.replaceWith(X(e,n,t,i,r,o)),d.push(e))}else{l.remove();let e="gemini_unconfigured"===s.status?"Gemini must be configured before opening Practice Questions. Switch to Ollama or configure Gemini in a regular ModelMind notebook.":s.message||"The practice review could not be completed.",t={role:"assistant",content:`⚠️ ${e}`,timestamp:new Date,isError:!0,provider:c};d.push(t),ep(t)}}catch(t){l.remove();let e={role:"assistant",content:`⚠️ ${t instanceof Error?t.message:"Could not reach the practice review service."}`,timestamp:new Date,isError:!0,provider:c};d.push(e),ep(e)}finally{m=!1,el.disabled=!1,et.disabled=!Z,eo.focus()}}el.className="mm-chatbot-send-btn",el.title="Send message",el.innerHTML="➤",en.append(er,ei,eo,el),L.append(z,en),eo.addEventListener("input",ed),em(),window.addEventListener("modelmind:gemini-key-updated",()=>{em()}),y.addEventListener("click",()=>ec("ollama")),w.addEventListener("click",()=>ec("gemini")),T.addEventListener("click",()=>{let e=t();e&&(eo.value+=(eo.value?"\n":"")+`\`\`\`python
${e.slice(0,3e3)}
\`\`\``,ed(),eo.focus())}),S.addEventListener("click",()=>{let e=a();if(e){let t=`Error: ${e.error_type}: ${e.error_message}
\`\`\`
${e.traceback.slice(0,1e3)}
\`\`\``;eo.value+=(eo.value?"\n":"")+t,ed(),eo.focus()}}),el.addEventListener("click",()=>{eu()}),window.addEventListener("modelmind:practice-question-selected",e=>{let t=e.detail,a=null==t?void 0:t.question;(null==a?void 0:a.question)&&a.id&&(Z=a.id,ee=a.title||"selected practice question",et.disabled=!1,et.title=`Check: ${a.title||"selected practice question"}`)}),eo.addEventListener("keydown",e=>{"Enter"!==e.key||e.shiftKey||(e.preventDefault(),eu())}),setInterval(()=>{let e=a();S.style.display=e?"inline-flex":"none"},2e3);let eh=document.createElement("div");eh.className="mm-chatbot-drop-overlay",eh.textContent="＋ Drop one CSV or code file to attach",g.append(b,N,L,eh);let eg=0;return g.addEventListener("dragenter",e=>{var t,a;Array.from(null!=(a=null==(t=e.dataTransfer)?void 0:t.types)?a:[]).includes("Files")&&(e.preventDefault(),eg+=1,g.classList.add("mm-chatbot-dragging-files"))}),g.addEventListener("dragover",e=>{var t,a;Array.from(null!=(a=null==(t=e.dataTransfer)?void 0:t.types)?a:[]).includes("Files")&&(e.preventDefault(),e.dataTransfer&&(e.dataTransfer.dropEffect="copy"))}),g.addEventListener("dragleave",e=>{var t,a;Array.from(null!=(a=null==(t=e.dataTransfer)?void 0:t.types)?a:[]).includes("Files")&&(e.preventDefault(),0===(eg=Math.max(0,eg-1))&&g.classList.remove("mm-chatbot-dragging-files"))}),g.addEventListener("drop",e=>{var t;let a=null==(t=e.dataTransfer)?void 0:t.files;(null==a?void 0:a.length)&&(e.preventDefault(),eg=0,g.classList.remove("mm-chatbot-dragging-files"),es(a))}),g}(e.serviceManager.serverSettings,()=>{let e=en(a);if(!e||!(0,r.isCodeCellModel)(e.model))return"";let t=e.model.toJSON().source;return(Array.isArray(t)?t.join(""):t).slice(0,2e4)},()=>ei(en(a))||eX,e2,e5,e4,e3,e6);e1.node.style.cssText="height:100%;overflow:hidden;",e1.node.appendChild(e8),e.shell.add(e1,"right",{rank:800}),e_.push(e1),o=l.NotebookActions,Y(),o&&o.executed&&o.executed.connect((e,t)=>{let{cell:a,success:n}=t;if(a){if(n)return void et(a);setTimeout(()=>{let e=a.model;if(!e||!e.outputs)return;let t=null,n=e.outputs.toJSON();for(let e=n.length-1;e>=0;e--)if("error"===n[e].output_type){t=n[e];break}if(t){let n=e.toJSON().source,i=Array.isArray(n)?n.join(""):String(n||"");!function(e,t){var a;let n,i,r,s,o,l,d,c;if(!e||!e.node)return;Y(),et(e);let m=function(e,t){let a;if(!e)return null;let n=t?t.split("\n"):[],i=n.length>0?n.length:1e4,r=/Cell In\[\d+\],\s*line\s*(\d+)/gi,s=[];for(;null!==(a=r.exec(e));){let e=parseInt(a[1],10);!isNaN(e)&&e>0&&s.push(e)}if(s.length>0){let e=s[s.length-1];if(e<=i)return e}let o=/<ipython-input-[^>]+>.*?line\s*(\d+)/gi,l=[];for(;null!==(a=o.exec(e));){let e=parseInt(a[1],10);!isNaN(e)&&e>0&&l.push(e)}if(l.length>0){let e=l[l.length-1];if(e<=i)return e}let d=/-{2,4}>\s*(\d+)/g,c=[];for(;null!==(a=d.exec(e));){let e=parseInt(a[1],10);!isNaN(e)&&e>0&&c.push(e)}if(c.length>0){let e=c[c.length-1];if(e<=i)return e}let m=/\bline\s*(\d+)/gi,p=[];for(;null!==(a=m.exec(e));){let e=parseInt(a[1],10);!isNaN(e)&&e>0&&p.push(e)}if(p.length>0){for(let e=p.length-1;e>=0;e--)if(p[e]<=i)return p[e];return p[p.length-1]}return null}(t.traceback,t.code),{explanation:p,tip:u}=function(e,t,a){let n=(e||"").trim(),i=(t||"").trim(),r=a?`Line ${a}`:"this line";switch(n){case"ZeroDivisionError":return{explanation:"Cannot divide a number by zero.",tip:"Check the denominator before performing division, or guard with an if-condition."};case"SyntaxError":if(i.includes("')' was never closed")||i.includes("'(' was never closed"))return{explanation:"Unclosed parenthesis: '(' was never closed.",tip:"Add the closing parenthesis ')' to complete the function call or expression."};if(i.includes("']' was never closed")||i.includes("'[' was never closed"))return{explanation:"Unclosed bracket: '[' was never closed.",tip:"Add the closing bracket ']' to close the list or index slice."};if(i.includes("'}' was never closed")||i.includes("'{' was never closed"))return{explanation:"Unclosed brace: '{' was never closed.",tip:"Add the closing brace '}' to close the dictionary or set."};if(i.includes("invalid syntax")||i.includes("expected ':'"))return{explanation:"Invalid syntax on or near this line.",tip:"Check for a missing colon ':' at the end of an if/for/def statement, or typos in keywords."};if(i.includes("unterminated string literal"))return{explanation:"Unterminated string literal: missing matching quote.",tip:"Ensure opening quotes (' or \") have a corresponding closing quote on the same line."};return{explanation:i?`Python syntax error: ${i}.`:"Python could not parse this line of code.",tip:"Check for unmatched parentheses, brackets, quotes, or a missing colon."};case"NameError":{let e=i.match(/name '([^']+)' is not defined/),t=e?`'${e[1]}'`:"Variable or name";return{explanation:`${t} is not defined in this notebook session.`,tip:`Check for spelling typos, or execute the cell where ${t} is defined or imported first.`}}case"TypeError":if(i.includes("unsupported operand type"))return{explanation:"Unsupported operand type: incompatible types cannot be combined.",tip:"Convert data types explicitly using int(), float(), or str(), or check types with type()."};if(i.includes("takes")&&i.includes("positional argument"))return{explanation:"Function called with an incorrect number of arguments.",tip:"Check the function signature or documentation for required parameters."};if(i.includes("'NoneType' object"))return{explanation:"Variable is None instead of an expected object or function.",tip:"Check if a preceding function returned None or if an assignment was missed."};if(i.includes("not callable"))return{explanation:"Object is not callable: attempting to call a non-function as a function.",tip:'Check if a function name was overwritten by a variable assignment (e.g. str = "abc").'};return{explanation:i?`Type error: ${i}.`:"Incompatible data type passed to operation.",tip:"Verify variable data types before performing this operation."};case"ValueError":return{explanation:i?`Value error: ${i}.`:"Inappropriate value passed to an operation or function.",tip:"Check input values, array dimensions, or valid parameter ranges."};case"KeyError":{let e=i.match(/['"]([^'"]+)['"]/),t=e?`'${e[1]}'`:"Key";return{explanation:`Key or DataFrame column ${t} was not found.`,tip:"Check df.columns or dict.keys() to confirm the exact name and capitalization."}}case"IndexError":return{explanation:"List or sequence index is out of range.",tip:"Check the length using len() to ensure the index is between 0 and len - 1."};case"AttributeError":{let e=i.match(/'([^']+)' object has no attribute '([^']+)'/);if(e)return{explanation:`'${e[1]}' object has no attribute or method '${e[2]}'.`,tip:`Check spelling or use dir(${e[1]}) to list all available methods and attributes.`};return{explanation:i?`Attribute error: ${i}.`:"The object does not have the specified attribute.",tip:"Check the object type and verify available attributes and methods."}}case"ModuleNotFoundError":case"ImportError":{let e=i.match(/No module named '([^']+)'/),t=e?e[1]:"package";return{explanation:`Module '${t}' is not installed or cannot be imported.`,tip:`Install it by running !pip install ${t} in a new cell, then re-run this cell.`}}case"FileNotFoundError":return{explanation:"The specified file or directory path does not exist.",tip:"Check the file path spelling, or use os.path.exists() and os.getcwd() to locate it."};case"IndentationError":return{explanation:"Indentation is misaligned or unexpected.",tip:"Use consistent 4-space indentation for every code block after a line ending in ':'."};default:return{explanation:i||`An error occurred during execution on ${r}.`,tip:`Inspect line ${null!=a?a:""} in the active cell and verify preceding variable values.`}}}(t.error_type,t.error_message,m),f=e.node,h=(e=!1)=>{var a,n;if(!m||m<=0)return;let i=f.querySelector(".cm-content");if(!i)return;let r=Array.from(i.querySelectorAll(":scope > .cm-line"));if(0===r.length)return;let s=m-1,o=null;if(s>=0&&s<r.length)o=r[s];else{let e=(null!=(a=(t.code||"").split("\n")[s])?a:"").trim();e&&(o=null!=(n=r.find(t=>(t.textContent||"").trim()===e))?n:null)}if(o&&(o.classList.contains("mm-code-error-line")||(f.querySelectorAll(".mm-code-error-line").forEach(e=>{e!==o&&e.classList.remove("mm-code-error-line")}),o.classList.add("mm-code-error-line")),e))try{o.scrollIntoView({behavior:"auto",block:"nearest"})}catch(e){}let l=f.querySelector(".cm-gutter.cm-lineNumbers");if(l){let e=l.querySelector(".mm-code-error-gutter");if(!e||(e.textContent||"").trim()!==String(m)){for(let t of(e&&e.classList.remove("mm-code-error-gutter"),Array.from(l.querySelectorAll(".cm-gutterElement"))))if((t.textContent||"").trim()===String(m)){t.classList.add("mm-code-error-gutter");break}}}};h(!0);let g=f.querySelector(".cm-content");if(g){let e=!1,t=new MutationObserver(()=>{e||(e=!0,requestAnimationFrame(()=>{e=!1,h(!1)}))});t.observe(g,{childList:!0}),Z.set(f,t)}let b=(a={errorType:t.error_type,errorLine:m,explanation:p,tip:u,onDismiss:()=>{et(e)}},(n=document.createElement("div")).className="mm-cell-error-card",(i=document.createElement("div")).className="mm-card-icon",i.textContent="!",(r=document.createElement("div")).className="mm-card-body",(s=document.createElement("div")).className="mm-card-title",o=a.errorLine?` — Line ${a.errorLine}`:"",s.textContent=`${a.errorType}${o}`,(l=document.createElement("div")).className="mm-card-desc",l.textContent=a.explanation,(d=document.createElement("div")).className="mm-card-tip",d.textContent=a.tip,r.append(s,l,d),(c=document.createElement("button")).type="button",c.className="mm-card-dismiss",c.textContent="✕",c.title="Dismiss error banner",c.addEventListener("click",()=>{var e;null==(e=a.onDismiss)||e.call(a),n.remove()}),n.append(i,r,c),n),x=f.querySelector(".jp-Cell-outputArea")||f.querySelector(".jp-OutputArea"),_=f.querySelector(".jp-Cell-inputWrapper");if(x){let e=document.createElement("div");e.className="jp-OutputArea-child mm-cell-error-row",e.style.cssText="margin: 6px 0 8px 0; width: 100%; display: flex; flex-direction: row;";let t=document.createElement("div");t.className="jp-OutputPrompt",t.style.cssText="visibility: hidden;";let a=document.createElement("div");a.className="jp-OutputArea-output",a.style.cssText="flex: 1 1 auto; padding: 0; min-width: 0; overflow: visible;",a.appendChild(b),e.append(t,a),x.insertBefore(e,x.firstChild)}else if(_&&_.parentNode){let e=document.createElement("div");e.className="jp-Cell-inputWrapper mm-cell-error-row",e.style.cssText="margin: 6px 0 8px 0; width: 100%; display: flex; flex-direction: row;";let t=document.createElement("div");t.className="jp-InputPrompt",t.style.cssText="visibility: hidden;";let a=document.createElement("div");a.style.cssText="flex: 1 1 auto; padding: 0; min-width: 0;",a.appendChild(b),e.append(t,a),_.parentNode.insertBefore(e,_.nextSibling)}if(e.model&&e.model.contentChanged){let t=()=>{et(e)};e.model.contentChanged.connect(t),ee.set(e,()=>{try{e.model.contentChanged.disconnect(t)}catch(e){}})}}(a,{error_type:String(t.ename||"RuntimeError"),error_message:String(t.evalue||""),traceback:Array.isArray(t.traceback)?t.traceback.join("\n"):String(t.traceback||""),code:i})}},40)}}),l.NotebookActions.executed.connect((t,n)=>{var i;let{cell:r,success:s}=n;s||["plain","practice"].includes(g(null==(i=a.currentWidget)?void 0:i.context.model))||setTimeout(()=>{let t=ei(r);t&&(eX=t,q({error_type:t.error_type,error_message:t.error_message,traceback:t.traceback,code:t.code},e.serviceManager.serverSettings))},75)});let e7=new E(e,a);e.shell.add(e7,"left",{rank:300}),ex.push(e7),d=e.serviceManager.serverSettings,function(){if(document.getElementById("mm-practice-questions-styles"))return;let e=document.createElement("style");e.id="mm-practice-questions-styles",e.textContent=`
    .mm-practice-root { height: 100%; display: flex; flex-direction: column; overflow: hidden; background: #f7f8fc; color: #24324a; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
    .mm-practice-header { padding: 15px 14px 13px; border-bottom: 1px solid #dbe3f0; background: linear-gradient(135deg, #f9fbff 0%, #f0f3ff 100%); }
    .mm-practice-title-row { display: flex; align-items: flex-start; gap: 10px; }
    .mm-practice-brand { display: flex; min-width: 0; flex: 1; align-items: center; gap: 10px; }
    .mm-practice-brand-mark { display: grid; width: 34px; height: 34px; flex: 0 0 34px; place-items: center; border-radius: 10px; background: linear-gradient(135deg, #6d4aff, #3f50db); box-shadow: 0 5px 12px rgba(79, 70, 229, .22); color: #fff; font-size: 20px; font-weight: 800; transform: rotate(-4deg); }
    .mm-practice-heading-copy { min-width: 0; }
    .mm-practice-kicker { color: #6851dc; font-size: 9px; font-weight: 850; letter-spacing: .13em; line-height: 1.2; }
    .mm-practice-title-row h2 { margin: 2px 0 0; color: #1d2d58; font-size: 16px; line-height: 1.18; letter-spacing: -.01em; }
    .mm-practice-collapse { border: 1px solid #cfd9eb; background: #fff; color: #4757c9; border-radius: 7px; padding: 5px 8px; box-shadow: 0 1px 1px rgba(38, 61, 105, .04); cursor: pointer; font-size: 10px; font-weight: 800; white-space: nowrap; }
    .mm-practice-collapse:hover { border-color: #7480eb; background: #f7f8ff; }
    .mm-practice-header p { margin: 10px 0 0; color: #60708a; font-size: 11px; line-height: 1.48; }
    .mm-practice-summary { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 11px; }
    .mm-practice-summary span { border: 1px solid #d8e1ef; border-radius: 999px; background: #fff; color: #52617a; padding: 3px 7px; font-size: 9px; font-weight: 800; }
    .mm-practice-summary span:first-child { border-color: #c8c0ff; background: #f1efff; color: #5846d1; }
    .mm-practice-controls { display: grid; grid-template-columns: 1fr; gap: 7px; padding: 11px 12px 10px; border-bottom: 1px solid #dfe6f1; background: #fff; }
    .mm-practice-control-label { color: #76839a; font-size: 9px; font-weight: 850; letter-spacing: .08em; text-transform: uppercase; }
    .mm-practice-controls input, .mm-practice-controls select { box-sizing: border-box; width: 100%; min-height: 31px; border: 1px solid #cfd9e8; border-radius: 7px; background: #fbfcff; color: #253452; padding: 7px 9px; font: inherit; font-size: 11px; outline: none; }
    .mm-practice-controls input:focus, .mm-practice-controls select:focus { border-color: #5d55df; box-shadow: 0 0 0 3px rgba(93, 85, 223, .12); background: #fff; }
    .mm-practice-count { color: #65738b; font-size: 10px; font-weight: 750; }
    .mm-practice-list { flex: 1; overflow: auto; padding: 11px 10px 18px; background: linear-gradient(180deg, #f9fafc, #f5f7fb); }
    .mm-practice-group { margin: 0 0 16px; }
    .mm-practice-group-heading { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; margin: 2px 3px 8px; color: #384b74; font-size: 10px; font-weight: 900; letter-spacing: .075em; text-transform: uppercase; }
    .mm-practice-group-heading span { color: #7c89a0; font-size: 9px; font-weight: 800; letter-spacing: 0; text-transform: none; }
    .mm-practice-group.code .mm-practice-group-heading { color: #2a65b7; }
    .mm-practice-group.review .mm-practice-group-heading { color: #6747cc; }
    .mm-practice-group.exact .mm-practice-group-heading { color: #168166; }
    .mm-practice-item { display: grid; grid-template-columns: 30px minmax(0, 1fr); gap: 9px; width: 100%; margin: 0 0 7px; padding: 10px; border: 1px solid #d9e1ed; border-radius: 9px; text-align: left; background: #fff; box-shadow: 0 1px 2px rgba(38, 61, 105, .035); color: inherit; cursor: pointer; transition: border-color .16s ease, box-shadow .16s ease, transform .16s ease; }
    .mm-practice-item:hover { border-color: #91a2e9; box-shadow: 0 5px 14px rgba(49, 72, 135, .09); transform: translateY(-1px); }
    .mm-practice-item.active { border-color: #4f46e5; background: linear-gradient(135deg, #f4f2ff, #fff); box-shadow: 0 0 0 2px rgba(79, 70, 229, .13), 0 6px 16px rgba(79, 70, 229, .08); }
    .mm-practice-number { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 8px; background: #edf0ff; color: #5143cb; font-size: 10px; font-weight: 900; }
    .mm-practice-item.active .mm-practice-number { background: #5749d8; color: #fff; }
    .mm-practice-item b { display: block; color: #293852; font-size: 12px; line-height: 1.3; }
    .mm-practice-item small { display: block; margin-top: 3px; color: #718099; font-size: 10px; line-height: 1.3; }
    .mm-practice-item em { display: inline-flex; margin-top: 5px; border-radius: 4px; background: #eef0fb; color: #5d50ca; padding: 2px 5px; font-size: 9px; font-style: normal; font-weight: 850; }
    .mm-practice-group.exact .mm-practice-item em { background: #e5f7f0; color: #14785f; }
    .mm-practice-status { padding: 18px 12px; color: #6d7a90; font-size: 12px; line-height: 1.5; }
    .mm-practice-status.error { color: #a32954; }
  `,document.head.appendChild(e)}(),(_=new c.Widget).id="modelmind-practice-questions",_.title.label="Practice Questions",_.title.caption="Select a ModelMind practice question",_.title.iconClass="mm-sidebar-icon mm-icon-practice",_.addClass("mm-practice-widget"),(v=document.createElement("div")).className="mm-practice-root",(y=document.createElement("header")).className="mm-practice-header",(w=document.createElement("div")).className="mm-practice-title-row",(C=document.createElement("div")).className="mm-practice-brand",(k=document.createElement("span")).className="mm-practice-brand-mark",k.setAttribute("aria-hidden","true"),k.textContent="✎",(T=document.createElement("div")).className="mm-practice-heading-copy",(S=document.createElement("div")).className="mm-practice-kicker",S.textContent="MODELMIND PRACTICE",(N=document.createElement("h2")).textContent="Choose a question",T.append(S,N),C.append(k,T),(M=document.createElement("button")).className="mm-practice-collapse",M.type="button",M.textContent="Hide panel",M.addEventListener("click",()=>{var t;let a=e.shell;null==(t=a.collapseLeft)||t.call(a)}),w.append(C,M),(L=document.createElement("p")).textContent="Choose a focused exercise, answer it in the notebook, then ask your AI teacher for clear feedback.",(F=document.createElement("div")).className="mm-practice-summary",F.setAttribute("aria-label","Practice bank summary"),y.append(w,L,F),(R=document.createElement("div")).className="mm-practice-controls",(D=document.createElement("span")).className="mm-practice-control-label",D.textContent="Browse question bank",(V=document.createElement("input")).placeholder="Search questions",V.type="search",W=document.createElement("select"),(ed=document.createElement("span")).className="mm-practice-count",R.append(D,V,W,ed),(ec=document.createElement("div")).className="mm-practice-list",v.append(y,R,ec),_.node.appendChild(v),em=[],ep="",eu=()=>{let e=V.value.trim().toLowerCase(),t=W.value,a=em.filter(a=>{let n=!t||a.topic===t,i=`${a.title} ${a.question} ${a.topic}`.toLowerCase();return n&&(!e||i.includes(e))}),n=a.filter(e=>"code"===e.gradingMode).length,i=a.filter(e=>"ai"===e.gradingMode).length,r=a.filter(e=>"exact"===e.gradingMode).length;if(ed.textContent=`${a.length} questions \xb7 ${n} coding \xb7 ${i} AI review${r?` \xb7 ${r} exact`:""}`,F.replaceChildren(Object.assign(document.createElement("span"),{textContent:`${em.length} questions`}),Object.assign(document.createElement("span"),{textContent:`${n} coding`}),Object.assign(document.createElement("span"),{textContent:`${i} teacher review`}),Object.assign(document.createElement("span"),{textContent:`${r} exact checks`})),ec.replaceChildren(),!a.length){let e=document.createElement("p");e.className="mm-practice-status",e.textContent="No questions match this search.",ec.appendChild(e);return}[{label:"Coding & debugging",className:"code",questions:a.filter(e=>"code"===e.gradingMode)},{label:"AI concept review",className:"review",questions:a.filter(e=>"ai"===e.gradingMode)},{label:"Quick exact checks",className:"exact",questions:a.filter(e=>"exact"===e.gradingMode)}].forEach(e=>{if(!e.questions.length)return;let t=document.createElement("section");t.className=`mm-practice-group ${e.className}`;let a=document.createElement("div");a.className="mm-practice-group-heading",a.innerHTML=`<strong>${e.label}</strong><span>${e.questions.length} question${1===e.questions.length?"":"s"}</span>`,t.appendChild(a),e.questions.forEach(e=>{let a=em.findIndex(t=>t.id===e.id)+1,n=document.createElement("button");n.type="button",n.className=`mm-practice-item${e.id===ep?" active":""}`;let i="code"===e.gradingMode?e.testsAvailable?"Code \xb7 tests":"Code \xb7 AI review":"exact"===e.gradingMode?"Exact check":"AI review";n.innerHTML=`<span class="mm-practice-number">${a}</span><span><b></b><small></small><em>${i}</em></span>`;let r=n.querySelector("b"),s=n.querySelector("small");r&&(r.textContent=e.title),s&&(s.textContent=`${e.topic} \xb7 ${e.level}`),n.addEventListener("click",()=>ef(e)),t.appendChild(n)}),ec.appendChild(t)})},ef=e=>{var t,n,i;let r,s,o;if((null==(t=a.currentWidget)?void 0:t.context.model.getMetadata("modelmind_notebook_type"))!=="practice")return;let l=a.currentWidget,d=null==l?void 0:l.content,c=null==d?void 0:d.model;if(!l||!d||!c)return;ep=e.id;let m=em.findIndex(t=>t.id===e.id)+1,p=d.widgets,u=p.findIndex(e=>e.model.getMetadata("modelmind_practice_role")===J),f=p.findIndex(e=>e.model.getMetadata("modelmind_practice_role")===K);u<0&&(c.sharedModel.insertCell(0,{cell_type:"markdown",source:"",metadata:{modelmind_practice_role:J}}),u=0),f<0&&(f=u+1,c.sharedModel.insertCell(f,{cell_type:"code",source:"",metadata:{trusted:!0,modelmind_practice_role:K}}));let h=d.widgets,g=h[u],b=h[f];null==g||g.model.sharedModel.setSource((r=[e.topic,e.level,e.type].filter(Boolean).join(" \xb7 "),s="code"===e.gradingMode?e.testsAvailable?"Hidden-test exercise":"AI-reviewed coding exercise":"exact"===e.gradingMode?"Exact-answer exercise":"AI teacher review",o=(null==(n=e.options)?void 0:n.length)?`

### Options
${e.options.map((e,t)=>`${t+1}. ${Q(e)}`).join("\n")}`:"",`# Practice ${String(m).padStart(3,"0")} — ${Q(e.title)}

**${r}**  
${s}

${Q(e.question)}${o}

> Write your response in the cell below. Then use **Check this answer** in the AI Chatbot panel on the right. Select Ollama or Gemini there before checking.`)),null==b||b.model.sharedModel.setSource((null==(i=e.options)?void 0:i.length)?"# My selected option (write its number):\n":e.starterCode?e.starterCode:"code"===e.gradingMode?"# Write your Python solution here\n":"# Write your explanation below. Use Python comments (#) or a print string so the AI teacher can read it.\n"),c.setMetadata("modelmind_practice_question_id",e.id),d.activeCellIndex=f,d.deselectAll(),b&&d.select(b),null==b||b.node.scrollIntoView({behavior:"smooth",block:"center"}),window.dispatchEvent(new CustomEvent("modelmind:practice-question-selected",{detail:{question:e}})),eu()},eh=async()=>{ec.innerHTML='<p class="mm-practice-status">Loading practice questions…</p>';try{let e=await f("api/practice/questions",d);em=Array.isArray(e.questions)?e.questions:[];let t=[...new Set(em.map(e=>e.topic))].sort();W.replaceChildren(),W.append(new Option("All topics","")),t.forEach(e=>W.append(new Option(e,e))),eu()}catch(e){ec.innerHTML='<p class="mm-practice-status error">Practice questions could not be loaded. Restart ModelMind and try again.</p>'}},V.addEventListener("input",eu),W.addEventListener("change",eu),eh(),ey=_,e.shell.add(ey,"left",{rank:290}),ev.push(ey);let e9=function(e,t){let a=new c.Widget;a.id="mm-api-key-settings",a.title.label=t.__("API Key"),a.title.caption=t.__("Manage Gemini credentials stored on this computer"),a.addClass("mm-api-key-settings-widget");let n=document.createElement("section");n.className="mm-key-settings";let i=document.createElement("header");i.className="mm-key-settings-header";let r=document.createElement("h2");r.textContent="API Key";let s=document.createElement("p");s.textContent="Gemini credentials stay in your computer's credential store.",i.append(r,s);let o=document.createElement("div");o.className="mm-key-settings-status",o.setAttribute("role","status"),o.setAttribute("aria-live","polite"),o.textContent="Checking saved credentials...";let l=(e,t="info")=>{o.textContent=e,o.dataset.state=t},d=document.createElement("form");d.className="mm-key-settings-form";let m=document.createElement("label");m.htmlFor="mm-gemini-api-key",m.textContent="Google Gemini API key";let p=document.createElement("input");p.id="mm-gemini-api-key",p.type="password",p.name="api_key",p.autocomplete="new-password",p.maxLength=512,p.placeholder="Paste your Gemini API key",p.required=!0,p.setAttribute("aria-describedby","mm-key-settings-note");let u=document.createElement("div");u.className="mm-key-settings-actions";let h=document.createElement("button");h.type="submit",h.textContent="Save key";let g=document.createElement("button");g.type="button",g.textContent="Remove key",g.disabled=!0,u.append(h,g);let b=document.createElement("p");b.id="mm-key-settings-note",b.className="mm-key-settings-note",b.textContent="The key is never shown again after saving and is not written to a notebook or browser storage. It is stored on the machine running Jupyter Server, so only save it from a server you trust. Gemini requests send the selected code and error context to Google. Ollama stays local.",d.append(m,p,u,b),n.append(i,o,d),a.node.appendChild(n);let x=e=>{p.disabled=e,h.disabled=e,g.disabled=e||"desktop"!==g.dataset.source},_=async()=>{try{let t=await f("api/settings/gemini-key",e);g.dataset.source=t.source||"",g.disabled="desktop"!==t.source,p.disabled=!1,h.disabled=!1,"desktop"===t.source?l("Your personal Gemini key is saved in this computer’s credential store.","success"):"environment"===t.source?l("A server Gemini key is configured. Saving here will use your personal key instead.","info"):l("No Gemini key saved on this computer.","warning")}catch(e){l("Could not read the system credential store. Check the Jupyter server log.","error"),p.disabled=!0,h.disabled=!0,g.disabled=!0}};if(d.addEventListener("submit",async t=>{t.preventDefault();let a=p.value.trim();if(!a){l("Enter a Gemini API key before saving.","warning"),p.focus();return}x(!0),l("Saving to the system credential store...");try{await f("api/settings/gemini-key",e,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({api_key:a})}),p.value="",l("Gemini key saved in this computer's credential store.","success"),window.dispatchEvent(new Event("modelmind:gemini-key-updated")),await _()}catch(e){l("Could not save the key. Check that the system credential store is available.","error")}finally{x(!1)}}),g.addEventListener("click",async()=>{x(!0),l("Removing saved Gemini key...");try{await f("api/settings/gemini-key",e,{method:"DELETE"}),p.value="",l("Saved Gemini key removed.","success"),window.dispatchEvent(new Event("modelmind:gemini-key-updated")),await _()}catch(e){l("Could not remove the key. Check that the system credential store is available.","error")}finally{x(!1)}}),!document.getElementById("mm-key-settings-styles")){let e=document.createElement("style");e.id="mm-key-settings-styles",e.textContent=`
      .mm-key-settings {
        box-sizing: border-box;
        width: 100%; min-width: 0; height: 100%;
        overflow-y: auto; padding: 18px 14px;
        color: #e2e8f0; background: #0f172a;
        font-family: 'Segoe UI', system-ui, sans-serif;
      }
      .mm-key-settings-header {
        margin: -18px -14px 16px; padding: 18px 14px 16px;
        background: linear-gradient(135deg, #1e1b4b, #0f172a);
        border-bottom: 1px solid rgba(167,139,250,.2);
      }
      .mm-key-settings-header h2 { margin: 0; color: #f1f5f9; font-size: 16px; }
      .mm-key-settings-header p, .mm-key-settings-note {
        color: #aab5c8; font-size: 11px; line-height: 1.6;
      }
      .mm-key-settings-header p { margin: 6px 0 0; }
      .mm-key-settings-status {
        box-sizing: border-box; width: 100%; padding: 10px;
        border: 1px solid rgba(167,139,250,.3);
        border-radius: 10px; color: #c4b5fd; background: rgba(30,27,75,.4);
        font-size: 12px; line-height: 1.5;
      }
      .mm-key-settings-status[data-state="success"] {
        border-color: rgba(167,139,250,.38); color: #c4b5fd;
        background: rgba(30,27,75,.48);
      }
      .mm-key-settings-status[data-state="warning"] {
        border-color: rgba(245,158,11,.35); color: #fcd34d;
        background: rgba(120,80,10,.16);
      }
      .mm-key-settings-status[data-state="error"] {
        border-color: rgba(248,113,113,.38); color: #fca5a5;
        background: rgba(127,29,29,.2);
      }
      .mm-key-settings-form { display: flex; flex-direction: column; gap: 9px; margin-top: 18px; }
      .mm-key-settings-form label { color: #dbe4f0; font-size: 11px; font-weight: 600; }
      .mm-key-settings-form input {
        box-sizing: border-box; width: 100%; min-width: 0; padding: 10px;
        border: 1px solid #334155; border-radius: 8px;
        outline: none; color: #f8fafc; background: #1e293b;
        font: inherit; font-size: 13px;
      }
      .mm-key-settings-form input:focus { border-color: #a78bfa; }
      .mm-key-settings-form input::placeholder { color: #aab5c8; opacity: 1; }
      .mm-key-settings-actions { display: flex; gap: 8px; }
      .mm-key-settings-actions button {
        box-sizing: border-box; min-width: 0; min-height: 38px; flex: 1;
        padding: 8px; border: 1px solid #5546a5; border-radius: 8px;
        color: #fff; background: #43358a; font: inherit; font-size: 12px;
        font-weight: 600; cursor: pointer;
      }
      .mm-key-settings-actions button:last-child {
        border-color: #475569; color: #cbd5e1; background: #1e293b;
      }
      .mm-key-settings-actions button:hover:not(:disabled) { filter: brightness(1.12); }
      .mm-key-settings-actions button:disabled { cursor: not-allowed; opacity: .5; }
      .mm-key-settings-note { margin: 2px 0 0; }
    `,document.head.appendChild(e)}return _(),a}(e.serviceManager.serverSettings,eg);e9.title.label="\uD83D\uDD11 API Key",e9.title.caption=eg.__("Save Gemini credentials in this computer’s credential store"),e.shell.add(e9,"right",{rank:700}),ex.push(e9),eS=()=>{eT()},a.currentChanged.connect((t,n)=>{if(!n)return void eS();let i=eE("left");for(let e of ex)e.hide();j(!1),n.context.ready.then(()=>{a.currentWidget===n&&(eM(n.context.model),i&&"modelmind-studio-sidebar"!==i&&requestAnimationFrame(()=>{eE("left")!==i&&e.shell.activateById(i)}))})}),a.currentWidget&&a.currentWidget.context.ready.then(eS);let te="modelmind:open-studio";e.commands.addCommand(te,{label:"Open ModelMind Studio",caption:"Open the unified ModelMind ML Studio slide bar in the left panel",execute:()=>{var t;let n=g(null==(t=a.currentWidget)?void 0:t.context.model);"plain"!==n&&"practice"!==n&&e.shell.activateById(e7.id)}}),t.viewMenu.addGroup([{command:te}],899);let tt=async e=>{let t=await i.newUntitled({type:"notebook"}),a=i.open(t.path);if(!a)throw Error(`Could not open the new ${e} notebook.`);if(!(a instanceof l.NotebookPanel))throw Error(`The new ${e} document is not a notebook.`);await a.context.ready,a.context.model.setMetadata(h,e),e7.refreshNotebookMode(),eS()},ta="modelmind:create-modelmind-notebook";e.commands.addCommand(ta,{label:"ModelMind Notebook",execute:()=>tt("modelmind")});let tn="modelmind:create-trainer-notebook";e.commands.addCommand(tn,{label:"Trainer Notebook",execute:()=>tt("trainer")});let ti="modelmind:create-plain-practice-notebook";e.commands.addCommand(ti,{label:"Plain ModelMind Notebook",caption:"Create a clean Jupyter notebook without ModelMind AI or Studio panels",execute:()=>tt("plain")});let tr="modelmind:create-practice-notebook";if(e.commands.addCommand(tr,{label:"Open Practice Questions",caption:"Open the ModelMind practice notebook with question navigation and AI review",execute:()=>tt("practice")}),t.fileMenu.newMenu.addGroup([{command:ta},{command:tn},{command:ti},{command:tr}],899),!document.getElementById("mm-left-panel-styles")){let e=document.createElement("style");e.id="mm-left-panel-styles",e.textContent=`
        /* Sidebar icon SVG stubs */
        .mm-sidebar-icon { background-size: 16px; background-repeat: no-repeat; background-position: center; }
        .mm-icon-xray::before  { content: '🔬'; font-size:16px; }
        .mm-icon-prep::before  { content: '🧠'; font-size:16px; }
        .mm-icon-lab::before   { content: '⚗️'; font-size:16px; }
        .mm-icon-practice {
          display: inline-grid;
          width: 22px;
          height: 22px;
          place-items: center;
        }
        .mm-icon-practice::before {
          content: '✎';
          display: grid;
          width: 17px;
          height: 17px;
          place-items: center;
          border: 2px solid #8b5cf6;
          border-radius: 5px;
          background: #f5f3ff;
          color: #6d3df2;
          font-family: ui-rounded, system-ui, sans-serif;
          font-size: 15px;
          font-weight: 800;
          line-height: 1;
          transform: rotate(-5deg);
        }

        .mm-left-panel { overflow: hidden; }
        .mm-left-panel-root {
          height: 100%; overflow-y: auto; padding: 0;
          background: #0f172a; color: #e2e8f0;
          font-family: 'Segoe UI', system-ui, sans-serif;
          display: flex; flex-direction: column;
        }

        .mm-left-panel-header {
          padding: 14px 14px 10px;
          background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%);
          border-bottom: 1px solid rgba(167,139,250,.2);
          flex-shrink: 0;
        }
        .mm-left-panel-title {
          font-size: 13px; font-weight: 800; display: flex; align-items: center; gap: 6px;
          background: linear-gradient(90deg, #a78bfa, #818cf8);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .mm-left-panel-sub { font-size: 10px; opacity: .5; margin-top: 3px; }

        .mm-left-panel-input-wrap {
          padding: 10px 12px 6px; display: flex; flex-direction: column; gap: 6px; flex-shrink: 0;
        }
        .mm-left-panel-input {
          background: #1e293b; border: 1px solid rgba(255,255,255,.12);
          color: #e2e8f0; padding: 7px 10px; border-radius: 7px; font-size: 11px;
          outline: none; width: 100%;
        }
        .mm-left-panel-input:focus { border-color: #a78bfa; }
        .mm-left-panel-note {
          padding: 0 12px 6px; font-size: 10px; opacity: .4; flex-shrink: 0;
        }
        .mm-left-panel-btn {
          padding: 8px 14px; border-radius: 7px; border: none; cursor: pointer;
          font-size: 12px; font-weight: 700; width: 100%; transition: all .15s;
        }
        .mm-btn-primary { background: linear-gradient(135deg,#7c3aed,#4f46e5); color:#fff; }
        .mm-btn-primary:hover { opacity:.85; transform:translateY(-1px); }

        .mm-left-level-row {
          display: flex; gap: 5px; padding: 4px 12px 8px; flex-shrink: 0;
        }
        .mm-level-btn {
          flex: 1; padding: 4px 6px; border-radius: 6px; border: 1px solid rgba(255,255,255,.12);
          background: transparent; color: #94a3b8; font-size: 10px; cursor: pointer;
          transition: all .15s;
        }
        .mm-level-btn.active {
          border-color: #a78bfa; background: rgba(167,139,250,.18); color: #a78bfa; font-weight: 700;
        }

        .mm-left-panel-content {
          flex: 1; overflow-y: auto; padding: 8px 10px;
        }
        .mm-left-empty {
          text-align: center; opacity: .45; font-size: 12px; padding: 20px 0;
        }

        /* Model Lab cards */
        .mm-model-card {
          margin: 8px 10px; border: 1px solid rgba(255,255,255,.08);
          border-radius: 10px; padding: 12px;
          background: rgba(255,255,255,.03); transition: all .2s;
        }
        .mm-model-card:not(.mm-model-soon):hover {
          border-color: rgba(167,139,250,.4); background: rgba(167,139,250,.07);
        }
        .mm-model-soon { opacity: .45; }
        .mm-model-card-top {
          display: flex; align-items: flex-start; gap: 8px; margin-bottom: 6px;
        }
        .mm-model-icon { font-size: 18px; }
        .mm-model-name { font-size: 12px; font-weight: 700; }
        .mm-model-cat { font-size: 9px; opacity: .5; letter-spacing:.5px; margin-top: 2px; }
        .mm-model-desc { font-size: 11px; opacity: .65; line-height: 1.4; }
        .mm-soon-tag {
          display: inline-block; font-size: 8px; padding: 1px 5px; border-radius: 99px;
          background: rgba(100,116,139,.2); color: #94a3b8; vertical-align: middle; margin-left: 4px;
        }
      `,document.head.appendChild(e)}e.commands.addCommand(ea,{label:"Open Error Assistant",execute:()=>{var t;let n=g(null==(t=a.currentWidget)?void 0:t.context.model);"plain"!==n&&"practice"!==n&&(e.shell.activateById(eb.id),e0())}});let ts=t.helpMenu;t.viewMenu.addGroup([{command:ea}],900),ts.hide(),e0(),m=[{match:(e,t)=>"filebrowser"===e||t.toLowerCase().includes("file browser"),shortName:"Upload / Files",fullName:"Upload Dataset & Files",description:"Upload CSV, Excel datasets & manage notebook files"},{match:(e,t)=>"jp-running-sessions"===e||t.toLowerCase().includes("running"),shortName:"Running",fullName:"Active Kernels & Sessions",description:"Monitor active kernels, terminals & running sessions"},{match:(e,t)=>"modelmind-practice-questions"===e||t.toLowerCase().includes("practice questions"),shortName:"Practice",fullName:"Practice Questions",description:"Choose a question for the current practice notebook"},{match:(e,t)=>e.includes("modelmind")||t.toLowerCase().includes("modelmind"),shortName:"ML Studio",fullName:"ModelMind ML Studio & Preprocessing",description:"Dataset Intelligence, Preprocessing Advisor & Model Selection"},{match:(e,t)=>e.includes("api-key")||t.toLowerCase().includes("api key"),shortName:"API Key",fullName:"ModelMind API Key Settings",description:"Store Gemini credentials in the computer’s credential store"},{match:(e,t)=>"table-of-contents"===e||t.toLowerCase().includes("table of contents")||t.toLowerCase().includes("outline"),shortName:"Outline",fullName:"Notebook Outline",description:"Table of contents, markdown headers & notebook outline"},{match:(e,t)=>e.includes("extension")||t.toLowerCase().includes("extension"),shortName:"Extensions",fullName:"Extensions & Tools",description:"Manage JupyterLab extensions and platform plugins"}],p=!1,(u=()=>{if(!p){p=!0;try{let e=document.querySelectorAll(".jp-SideBar.jp-mod-left .lm-TabBar-tab");if(!e||0===e.length)return;e.forEach(e=>{let t=e.getAttribute("data-id")||"",a=e.getAttribute("title")||"",n=m.find(e=>e.match(t,a));if(!n)return;let i=`${n.fullName} — ${n.description}`;e.title!==i&&(e.title=i);let r=e.querySelector(".mm-sidebar-tab-label");r||((r=document.createElement("div")).className="mm-sidebar-tab-label",e.appendChild(r)),r.textContent!==n.shortName&&(r.textContent=n.shortName);let s=e.querySelector(".lm-TabBar-tabLabel");s&&"none"!==s.style.display&&(s.style.display="none")})}finally{p=!1}}})(),[100,300,700,1500,3e3,5e3].forEach(e=>setTimeout(u,e)),(b=document.querySelector(".jp-SideBar.jp-mod-left .lm-TabBar-content"))?new MutationObserver(()=>u()).observe(b,{childList:!0}):setTimeout(()=>{let e=document.querySelector(".jp-SideBar.jp-mod-left .lm-TabBar-content");e&&new MutationObserver(()=>u()).observe(e,{childList:!0})},1e3),function(){let e,t=[{match:(e,t)=>"ml-platform-error-assistant-panel"===e||t.toLowerCase().includes("error"),shortName:"Error Assistant"},{match:(e,t)=>"mm-ai-chatbot-panel"===e||t.toLowerCase().includes("chat")||t.toLowerCase().includes("ollama"),shortName:"AI Chat"},{match:(e,t)=>e.includes("api-key")||t.toLowerCase().includes("api key"),shortName:"API Key"}];if(!document.getElementById("mm-right-sidebar-label-styles")){let e=document.createElement("style");e.id="mm-right-sidebar-label-styles",e.textContent=`
      .jp-SideBar.jp-mod-right .lm-TabBar-tab .lm-TabBar-tabLabel {
        display: none !important;
      }
      .jp-SideBar.jp-mod-right .lm-TabBar-tab .mm-sidebar-tab-label {
        display: block;
        font-size: 14.5px;
        font-weight: 700;
        writing-mode: vertical-rl;
        text-orientation: mixed;
        transform: rotate(180deg);
        letter-spacing: 0.8px;
        white-space: nowrap;
        color: #334155;
        margin: 0 auto;
        padding: 8px 0;
        font-family: system-ui, -apple-system, sans-serif;
      }
    `,document.head.appendChild(e)}let a=!1,n=()=>{if(!a){a=!0;try{let e=document.querySelectorAll(".jp-SideBar.jp-mod-right .lm-TabBar-tab");if(!e||0===e.length)return;e.forEach(e=>{let a=e.getAttribute("data-id")||"",n=e.getAttribute("title")||"",i=t.find(e=>e.match(a,n));if(!i)return;e.title!==i.shortName&&(e.title=i.shortName);let r=e.querySelector(".mm-sidebar-tab-label");r||((r=document.createElement("div")).className="mm-sidebar-tab-label",e.appendChild(r)),r.textContent!==i.shortName&&(r.textContent=i.shortName);let s=e.querySelector(".lm-TabBar-tabIcon");s&&"none"!==s.style.display&&(s.style.display="none")})}finally{a=!1}}};n(),[100,300,700,1500,3e3,5e3].forEach(e=>setTimeout(n,e)),(e=document.querySelector(".jp-SideBar.jp-mod-right .lm-TabBar-content"))?new MutationObserver(()=>n()).observe(e,{childList:!0}):setTimeout(()=>{let e=document.querySelector(".jp-SideBar.jp-mod-right .lm-TabBar-content");e&&new MutationObserver(()=>n()).observe(e,{childList:!0})},1e3)}()}}},665(e,t,a){e.exports=a.p+"68c5c2a70ed031f3.png"}}]);