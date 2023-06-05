export async function until(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
