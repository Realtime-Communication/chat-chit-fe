export const loginAccount = async (body: Record<string, any>) => {
  const res = await fetch(`http://localhost:8080/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error("Login failed");
  }

  const result = await res.json();
  return result.data;
};