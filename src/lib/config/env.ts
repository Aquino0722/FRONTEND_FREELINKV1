export type ApiMode = "mock" | "real";
export type MockScenario = "default" | "empty" | "error" | "slow";

function scenario(value: string | undefined): MockScenario {
  return ["default", "empty", "error", "slow"].includes(value ?? "")
    ? (value as MockScenario)
    : "default";
}

export const env = {
  apiMode: (process.env.NEXT_PUBLIC_API_MODE === "real" ? "real" : "mock") as ApiMode,
  apiBaseUrl:
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5021/api",
  mockScenario: scenario(process.env.NEXT_PUBLIC_MOCK_SCENARIO),
  mockDelay: Number(process.env.NEXT_PUBLIC_MOCK_DELAY ?? 650),
};
