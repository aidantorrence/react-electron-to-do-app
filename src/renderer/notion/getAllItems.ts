/* eslint-disable consistent-return */
export default async function getAllItems() {
  try {
    const res = await fetch('http://localhost:8080/notion');
    const data = await res.json();
    return JSON.parse(data);
  } catch (e) {
    console.log(e);
  }
}
