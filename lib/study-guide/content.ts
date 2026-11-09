export const CATEGORIES = [
  "Foundations",
  "Correlation & Regression",
  "Hypothesis Testing",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface KeyTerm {
  term: string;
  definition: string;
}

export interface Formula {
  label: string;
  expression: string;
}

export interface WorkedExample {
  title: string;
  steps: string[];
}

export interface Lesson {
  id: string;
  category: Category;
  title: string;
  summary: string;
  explanation: string[];
  terms: KeyTerm[];
  formulas: Formula[];
  example?: WorkedExample;
  notes: string[];
  referenceIds: string[];
}

export const LESSONS: Lesson[] = [
  {
    id: "normal-distribution",
    category: "Foundations",
    title: "The normal distribution",
    summary:
      "A symmetric, bell-shaped distribution described completely by its mean (μ) and standard deviation (σ).",
    explanation: [
      "The normal distribution is centered at its mean, and its spread is set by the standard deviation. Values near the mean are common, and values far from it are rare.",
      "The empirical rule says that about 68% of values fall within 1 standard deviation of the mean, about 95% within 2, and about 99.7% within 3.",
      "A z-score tells you how many standard deviations a value is from the mean. Converting to z-scores lets you use one standard normal table (mean 0, standard deviation 1) for any normal variable.",
    ],
    terms: [
      { term: "Mean (μ)", definition: "The center of the distribution, or the average value." },
      { term: "Standard deviation (σ)", definition: "A measure of the typical distance of values from the mean." },
      { term: "z-score", definition: "The number of standard deviations a value lies above or below the mean." },
      { term: "Standard normal distribution", definition: "The normal distribution with mean 0 and standard deviation 1." },
    ],
    formulas: [{ label: "z-score", expression: "z = (x − μ) / σ" }],
    example: {
      title: "Exam scores with μ = 70 and σ = 10",
      steps: [
        "A student scores x = 85.",
        "z = (85 − 70) / 10 = 1.5.",
        "The score is 1.5 standard deviations above the mean. The standard normal table gives about 0.9332 at z = 1.5, so roughly 93% of scores are lower.",
      ],
    },
    notes: [
      "The curve is symmetric, so the mean, median and mode are equal.",
      "Real data are only approximately normal, so look at a histogram first.",
    ],
    referenceIds: ["openstax-intro-stats"],
  },
  {
    id: "central-limit-theorem",
    category: "Foundations",
    title: "Sampling distributions and the central limit theorem",
    summary:
      "Means of large random samples are approximately normally distributed, whatever the shape of the population.",
    explanation: [
      "If you take many random samples of size n and compute each sample mean, those means form a sampling distribution. Its center is the population mean μ, and its spread, called the standard error, is σ / √n.",
      "The central limit theorem says this sampling distribution gets closer to normal as n grows. A common rule of thumb is n ≥ 30, but strongly skewed data may need more.",
      "This is why z and t procedures about a mean can work even when the raw data are not perfectly normal.",
    ],
    terms: [
      { term: "Sampling distribution", definition: "The distribution of a statistic, such as the mean, over many random samples." },
      { term: "Standard error", definition: "The standard deviation of a sampling distribution." },
      { term: "Sample size (n)", definition: "The number of observations in one sample." },
    ],
    formulas: [{ label: "Standard error of the mean", expression: "SE = σ / √n" }],
    example: {
      title: "σ = 12 and n = 36",
      steps: [
        "SE = 12 / √36 = 12 / 6 = 2.",
        "A sample mean typically lands within about 2 units of μ.",
        "Quadrupling the sample size to 144 halves the standard error to 1.",
      ],
    },
    notes: [
      "Larger samples give smaller standard errors, so more precise estimates.",
      "The theorem is about sample means, not individual values.",
    ],
    referenceIds: ["openstax-intro-stats"],
  },
  {
    id: "correlation",
    category: "Correlation & Regression",
    title: "Pearson correlation",
    summary:
      "Pearson's r measures the strength and direction of a straight-line relationship between two numeric variables.",
    explanation: [
      "r ranges from −1 to +1. A positive r means y tends to rise as x rises, and a negative r means y tends to fall. A value near 0 means there is little straight-line relationship.",
      "As a rough guide, |r| above about 0.7 is often called strong, but what counts as strong depends on the field.",
      "Always look at a scatter plot. Outliers or a curved pattern can make r misleading.",
    ],
    terms: [
      { term: "Pearson r", definition: "A number from −1 to +1 describing the strength and direction of a linear relationship." },
      { term: "Scatter plot", definition: "A graph of paired (x, y) values used to see the pattern of a relationship." },
      { term: "Outlier", definition: "A point that lies far from the overall pattern of the data." },
    ],
    formulas: [
      { label: "Pearson r", expression: "r = Σ(x − x̄)(y − ȳ) / √[ Σ(x − x̄)² · Σ(y − ȳ)² ]" },
    ],
    example: {
      title: "Data: (1,2), (2,4), (3,5), (4,6), (5,9), (6,10)",
      steps: [
        "x̄ = 3.5 and ȳ = 6.",
        "Σ(x − x̄)(y − ȳ) = 28, Σ(x − x̄)² = 17.5 and Σ(y − ȳ)² = 46.",
        "r = 28 / √(17.5 × 46) = 28 / √805 ≈ 0.987, a very strong positive relationship.",
      ],
    },
    notes: [
      "Correlation does not prove causation.",
      "r only detects straight-line relationships.",
    ],
    referenceIds: ["openstax-intro-stats", "nist-handbook"],
  },
  {
    id: "linear-regression",
    category: "Correlation & Regression",
    title: "Simple linear regression",
    summary:
      "Simple linear regression fits the line ŷ = b₀ + b₁x that best predicts y from x.",
    explanation: [
      "The least-squares line minimises the sum of the squared residuals, which are the gaps between actual and predicted y. The slope b₁ is the average change in y for each one-unit increase in x. The intercept b₀ is the predicted y when x is 0, which is not always meaningful.",
      "R² is the proportion of the variation in y that is explained by x. An R² of 0.97 means 97% of the variation is explained by the line.",
      "Use the line to predict only within the range of observed x values. Predicting outside that range is extrapolation and can be unreliable.",
    ],
    terms: [
      { term: "Residual", definition: "Actual y minus predicted y for one observation." },
      { term: "Slope (b₁)", definition: "The average change in y for a one-unit increase in x." },
      { term: "Intercept (b₀)", definition: "The predicted value of y when x = 0." },
      { term: "R²", definition: "The share of the variation in y explained by the regression line." },
      { term: "Extrapolation", definition: "Predicting for x values outside the range of the data." },
    ],
    formulas: [
      { label: "Slope", expression: "b₁ = Σ(x − x̄)(y − ȳ) / Σ(x − x̄)²" },
      { label: "Intercept", expression: "b₀ = ȳ − b₁x̄" },
      { label: "R² in simple regression", expression: "R² = r²" },
    ],
    example: {
      title: "Same data as the correlation lesson",
      steps: [
        "b₁ = 28 / 17.5 = 1.6.",
        "b₀ = 6 − 1.6 × 3.5 = 0.4, so ŷ = 0.4 + 1.6x.",
        "Predict for x = 4.5: ŷ = 0.4 + 1.6 × 4.5 = 7.6, which is inside the observed range.",
        "R² = 0.987² ≈ 0.974, so about 97% of the variation in y is explained by x.",
      ],
    },
    notes: [
      "Check the residuals for patterns, which can show the line is not a good fit.",
      "A high R² does not show that x causes y.",
    ],
    referenceIds: ["openstax-intro-stats", "nist-handbook"],
  },
  {
    id: "hypothesis-basics",
    category: "Hypothesis Testing",
    title: "Hypothesis testing basics",
    summary:
      "A hypothesis test asks whether sample data give enough evidence against a claim about a population.",
    explanation: [
      "The null hypothesis (H₀) is the default claim, usually that there is no difference or no effect. The alternative hypothesis (H₁) is what you look for evidence of.",
      "Choose a significance level α, commonly 0.05, before looking at the data. The p-value is the probability of a result at least as extreme as yours if H₀ were true. If p ≤ α, reject H₀.",
      "Equivalently, compare the test statistic with the critical value and reject H₀ if the statistic falls in the rejection region.",
      "A two-tailed test (H₁: μ ≠ μ₀) looks for a difference in either direction. A one-tailed test looks in one direction only and must be chosen before seeing the data.",
    ],
    terms: [
      { term: "Null hypothesis (H₀)", definition: "The default claim that the test tries to find evidence against." },
      { term: "Alternative hypothesis (H₁)", definition: "The claim supported if H₀ is rejected." },
      { term: "Significance level (α)", definition: "The cutoff for rejecting H₀, and the probability of a Type I error." },
      { term: "p-value", definition: "The probability of a result at least as extreme as the sample result, assuming H₀ is true." },
      { term: "Critical value", definition: "The boundary of the rejection region for the test statistic." },
      { term: "Type I error", definition: "Rejecting H₀ when it is actually true." },
      { term: "Type II error", definition: "Failing to reject H₀ when it is actually false." },
    ],
    formulas: [{ label: "Decision rule (p-value)", expression: "Reject H₀ if p ≤ α" }],
    example: {
      title: "Using α = 0.05",
      steps: [
        "If p = 0.03, then p ≤ 0.05, so reject H₀.",
        "If p = 0.20, then p > 0.05, so fail to reject H₀.",
      ],
    },
    notes: [
      "Say \"fail to reject H₀\" instead of \"accept H₀\".",
      "A small p-value does not mean the effect is large or important.",
      "The p-value is not the probability that H₀ is true.",
    ],
    referenceIds: ["openstax-intro-stats", "psu-stat500"],
  },
  {
    id: "z-test",
    category: "Hypothesis Testing",
    title: "One-sample Z-test",
    summary:
      "Tests a claim about a population mean when the population standard deviation σ is known.",
    explanation: [
      "Compute how many standard errors the sample mean is from the hypothesized mean, then compare that z value with the standard normal distribution.",
      "Assumptions: a random sample, σ known, and a population that is normal or a sample large enough for the central limit theorem.",
      "Common critical values: ±1.96 for a two-tailed test at α = 0.05, 1.645 for a one-tailed test at α = 0.05, and ±2.576 for a two-tailed test at α = 0.01.",
    ],
    terms: [
      { term: "Test statistic", definition: "A number computed from the sample and compared with a reference distribution." },
      { term: "Hypothesized mean (μ₀)", definition: "The population mean claimed by H₀." },
      { term: "Rejection region", definition: "The values of the test statistic that lead to rejecting H₀." },
    ],
    formulas: [{ label: "Z statistic", expression: "z = (x̄ − μ₀) / (σ / √n)" }],
    example: {
      title: "H₀: μ = 100 with n = 36, x̄ = 105 and σ = 12",
      steps: [
        "SE = 12 / √36 = 2.",
        "z = (105 − 100) / 2 = 2.5.",
        "At α = 0.05 (two-tailed) the critical values are ±1.96. Since 2.5 > 1.96, reject H₀.",
        "The two-tailed p-value is about 0.012, which agrees with the decision.",
      ],
    },
    notes: [
      "Use a Z-test only when σ is known. Otherwise use the t-test.",
      "These are the same sample numbers as the dashboard example.",
    ],
    referenceIds: ["openstax-intro-stats", "psu-stat500"],
  },
  {
    id: "t-test",
    category: "Hypothesis Testing",
    title: "One-sample t-test",
    summary:
      "Tests a claim about a population mean when σ is unknown and the sample standard deviation s is used instead.",
    explanation: [
      "The t statistic has the same form as z but uses s in place of σ. It follows a t distribution with n − 1 degrees of freedom, which has heavier tails than the normal distribution, so critical values are larger for small samples.",
      "As n grows, the t distribution approaches the normal distribution.",
      "Assumptions: a random sample, and data that are roughly normal or a reasonably large sample.",
    ],
    terms: [
      { term: "Degrees of freedom (df)", definition: "For a one-sample t-test, n − 1." },
      { term: "Sample standard deviation (s)", definition: "The standard deviation computed from the sample." },
      { term: "t distribution", definition: "A bell-shaped distribution with heavier tails than the normal, used when σ is unknown." },
    ],
    formulas: [
      { label: "t statistic", expression: "t = (x̄ − μ₀) / (s / √n)" },
      { label: "Degrees of freedom", expression: "df = n − 1" },
    ],
    example: {
      title: "H₀: μ = 50 with n = 16, x̄ = 52 and s = 6",
      steps: [
        "SE = 6 / √16 = 1.5.",
        "t = (52 − 50) / 1.5 ≈ 1.33 with df = 15.",
        "At α = 0.05 (two-tailed) the critical values are ±2.131. Since |1.33| < 2.131, fail to reject H₀.",
      ],
    },
    notes: [
      "Use t whenever σ is unknown, which is the usual situation in practice.",
      "Failing to reject H₀ means the sample does not give enough evidence against it.",
    ],
    referenceIds: ["openstax-intro-stats"],
  },
];
