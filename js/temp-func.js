function createSlug(teks) {
  return teks
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD') // Menghapus aksen/tanda di huruf
    .replace(/[\u0300-\u036f]/g, '') // Membersihkan sisa tanda baca di atas
    .replace(/\s+/g, '-') // Ganti spasi dengan tanda hubung (-)
    .replace(/[^\w\-]+/g, '') // Hapus karakter spesial selain huruf, angka, dan strip
    .replace(/\-\-+/g, '-'); // Ganti strip ganda dengan strip tunggal

  // Contoh penggunaan:
  console.log(createSlug("Belajar Membuat Slug dengan JavaScript!")); 
  // Output: "belajar-membuat-slug-dengan-javascript"

}

