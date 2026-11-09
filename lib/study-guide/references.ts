export interface Reference {
  id: string;
  title: string;
  author: string;
  date?: string;
  url: string;
  note: string;
}

export const REFERENCES: Reference[] = [
  {
    id: "openstax-intro-stats",
    title: "Introductory Statistics 2e",
    author: "Barbara Illowsky and Susan Dean, OpenStax",
    url: "https://openstax.org/books/introductory-statistics-2e/pages/1-introduction",
    note:
      "Free university textbook. Chapter 6 covers the normal distribution, Chapter 7 the central limit theorem, Chapter 9 hypothesis testing with one sample, and Chapter 12 linear regression and correlation.",
  },
  {
    id: "nist-handbook",
    title: "NIST/SEMATECH e-Handbook of Statistical Methods (NIST Handbook 151)",
    author:
      "N. Heckert, J. Filliben, C. Croarkin, B. Hembree, W. Guthrie, P. Tobias and J. Prinz, National Institute of Standards and Technology",
    date: "2002",
    url: "https://www.itl.nist.gov/div898/handbook/",
    note:
      "A US government web handbook on statistical methods, including exploratory data analysis, regression and statistical modeling.",
  },
  {
    id: "psu-stat500",
    title: "STAT 500: Applied Statistics",
    author: "Penn State Department of Statistics",
    url: "https://online.stat.psu.edu/stat500/",
    note:
      "Open course notes from Penn State. Includes hypothesis testing for a population mean using both the critical value and p-value approaches.",
  },
];
