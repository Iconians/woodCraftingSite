export const purchaseItems = (formData: object, token: string) => {
  return fetch("http://localhost:3000/user/purchase", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(formData),
  });
};
