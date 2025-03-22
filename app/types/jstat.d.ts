declare module 'jstat' {
  export const jStat: {
    // Distribution functions
    normal: {
      cdf: (x: number, mean?: number, standardDeviation?: number) => number;
      inv: (p: number, mean?: number, standardDeviation?: number) => number;
      pdf: (x: number, mean?: number, standardDeviation?: number) => number;
      sample: (mean?: number, standardDeviation?: number) => number;
    };
    
    // Student t distribution
    studentt: {
      cdf: (x: number, degreesOfFreedom: number) => number;
      inv: (p: number, degreesOfFreedom: number) => number;
      pdf: (x: number, degreesOfFreedom: number) => number;
    };
    
    // Statistical functions
    mean: (arr: number[] | number[][]) => number | number[];
    median: (arr: number[] | number[][]) => number | number[];
    mode: (arr: number[] | number[][]) => number | number[];
    stdev: (arr: number[] | number[][], flag?: boolean) => number | number[];
    variance: (arr: number[] | number[][], flag?: boolean) => number | number[];
    
    // Hypothesis testing
    ttest: (arr: number[], mu?: number) => number;
    
    // General utility
    sum: (arr: number[] | number[][]) => number | number[];
    min: (arr: number[] | number[][]) => number | number[];
    max: (arr: number[] | number[][]) => number | number[];
    
    // Matrix operations
    create: (rows: number, cols: number, func?: Function) => number[][];
    zeros: (rows: number, cols?: number) => number[][] | number[];
    ones: (rows: number, cols?: number) => number[][] | number[];
    
    // Additional utils
    seq: (min: number, max: number, length?: number) => number[];
    
    // Generic statistical calculations
    percentile: (arr: number[], k: number) => number;
    quartiles: (arr: number[]) => number[];
    covariance: (arr1: number[], arr2: number[]) => number;
    corrcoeff: (arr1: number[], arr2: number[]) => number;
  };
  
  // Allow direct import of jStat
  export default jStat;
} 