export default async function readFile(filePath) {
  try {
    const res = await fetch(filePath);
    if (res.status !== 200) throw new Error("Failed to read file")
    const text = res.text();
    return text;
  } catch (err) {
    console.log(err)
    return err.toString();
  }
}
