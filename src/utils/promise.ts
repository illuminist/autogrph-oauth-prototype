export const sleep = (timems: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, timems))
