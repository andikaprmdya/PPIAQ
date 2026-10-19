# Panduan Admin Pemilihan PPIAQ
Pemilihan Presiden | Ordinary dan Associate | Bahasa Indonesia
Versi 19 Oktober 2026

## Alur yang akan Anda jalankan
Buat draft → isi kandidat dan jadwal → tag anggota finansial → simpan dan preview → publish dan kirim undangan → pantau partisipasi → tutup dan unduh hasil.

Panduan ini untuk panitia yang memiliki akun berperan ADMIN. Anggota biasa dan curator tidak mendapat akses pengelolaan pemilihan. Membuat akun baru tidak otomatis memberikan hak admin; pengelola sistem yang berwenang harus memberikan peran tersebut.

## 1. Masuk ke halaman admin
1. Buka https://ppiaqueensland.org/auth/login dan masuk menggunakan akun admin Anda.
2. Pilih Elections / Pemilihan pada menu admin, atau buka https://ppiaqueensland.org/admin/elections.
3. Jika diminta masuk ulang setelah pembaruan website, login kembali. Sesi lama perlu diganti dengan sesi bertanda tangan yang baru.
4. Klik + Create draft / + Buat draft. Draft awal yang sudah disiapkan juga dapat langsung dibuka dari daftar pemilihan.

## Pahami status pemilihan
- DRAFT: dapat ditambah, diedit, dan dihapus. Tidak mengirim email dan belum dapat digunakan untuk memilih.
- PUBLISHED: undangan dikirim dan jadwal voting berlaku. Kandidat, isi undangan, dan daftar pemilih terkunci.
- CLOSED: voting ditutup. Hasil akhir dapat diperiksa dan diunduh.
- CANCELLED: pemilihan dibatalkan. Catatan dipertahankan, dan angka yang terlihat bukan hasil pemilihan yang dinyatakan sah.

Jangan klik Publish untuk sekadar mencoba tampilan. Gunakan Preview email yang tidak mengirim pesan.

<!-- pagebreak -->
# Siapkan jadwal dan kandidat
## 2. Edit detail pemilihan
1. Buka draft, lalu isi Title / Judul dan Introduction for voters / Pengantar untuk pemilih.
2. Tentukan Voting opens dan Voting closes. Semua input memakai waktu Brisbane / AEST (UTC+10), termasuk ketika admin sedang berada di Indonesia.
3. Jam penutupan harus sesudah jam pembukaan dan masih berada di masa depan ketika publish dilakukan.
4. Aktifkan Allow an abstain option jika pemilih boleh menggunakan hak pilih tanpa memilih kandidat.

Contoh: jika panitia menetapkan voting buka pukul 09.00 Brisbane, masukkan 09.00 pada halaman admin. Jangan mengubahnya menjadi WIB. Waktu tersebut sama dengan 06.00 WIB pada tanggal yang sama.

## 3. Tambah, edit, dan hapus kandidat
1. Klik + Add candidate / + Tambah kandidat.
2. Isi Name / Nama dan Profile & manifesto / Profil, visi & misi. Teks akan ditampilkan kepada pemilih.
3. Tambahkan minimal dua kandidat dengan nama yang berbeda sebelum publish. Maksimal 20 kandidat.
4. Untuk mengubah kandidat, edit kolomnya. Untuk menghapus, klik Remove candidate / Hapus kandidat pada kartu yang bersangkutan.
5. Klik Save draft / Simpan draft. Perubahan kandidat hanya boleh dilakukan selama status DRAFT.

## Menyimpan dan memuat ulang
Save draft hanya menyimpan perubahan. Tidak ada email yang dikirim. Jika ada pesan unsaved changes, simpan dahulu sebelum publish. Jika draft diubah admin lain, server menolak versi yang lama; muat ulang sebelum melanjutkan agar perubahan panitia lain tidak tertimpa.


<!-- pagebreak -->
# Tag anggota yang berhak memilih
## 4. Tentukan daftar anggota finansial
Anggota ORDINARY dan ASSOCIATE sama-sama dapat dipilih apabila status keanggotaannya APPROVED dan masa keanggotaannya aktif pada waktu voting dibuka. Jika tanggal akhir tidak tersedia, sistem memakai satu tahun sejak tanggal bergabung, tanggal persetujuan, atau tanggal akun dibuat, mengikuti urutan tersebut.

PENTING: status APPROVED dan masa aktif tidak otomatis menjadi bukti pembayaran. Panitia harus mencocokkan daftar dengan catatan iuran. Tag pada pemilihan ini adalah konfirmasi panitia bahwa anggota tersebut sudah memenuhi persyaratan finansial.

1. Cari anggota menggunakan nama, email, ID anggota, atau kampus.
2. Centang Tag hanya untuk anggota yang sudah diverifikasi pembayaran dan identitasnya.
3. Tag all active members tersedia untuk memilih semua anggota aktif sekaligus. Pakai hanya setelah seluruh pembayaran mereka diperiksa.
4. Gunakan Clear tags untuk mengosongkan pilihan jika perlu memulai ulang.
5. Jika jadwal buka berubah, klik Check eligibility at opening time dan tinjau kembali daftar.
6. Simpan draft. Anggota yang tidak dipilih tidak akan menerima undangan dan tidak mendapat hak pilih untuk pemilihan tersebut.

## ID anggota dan Voter ID
- Jika anggota memiliki member number yang valid, nomor tersebut menjadi Voter ID dalam pemilihan ini.
- Jika nomor belum tersedia, sistem membuat Voter ID unik dengan awalan V-.
- Email dan nomor anggota yang sama tidak boleh muncul sebagai pemilih ganda. Koreksi data anggota yang duplikat sebelum menyimpan atau publish.
- Voter ID adalah referensi administrasi. Nomor ini bukan kata sandi untuk memilih; tautan rahasia dari email tetap diperlukan.

## Sebelum publish
Periksa nama, alamat email, masa aktif, dan jumlah penerima. Pastikan satu orang tidak memiliki dua akun dengan email atau nomor yang berbeda. Sistem mencegah satu kredensial dipakai dua kali, tetapi ketepatan daftar orang tetap menjadi tanggung jawab panitia.

Setelah publish, daftar pemilih dibekukan. Anggota yang baru disetujui atau baru membayar tidak otomatis masuk ke pemilihan yang sudah dipublish.

<!-- pagebreak -->
# Edit undangan dan publish
## 5. Siapkan email pribadi
Edit Subject / Subjek dan Email message / Isi email. Pesan berupa teks biasa; teks HTML tidak dijalankan. Gunakan placeholder berikut dengan ejaan persis:
- {{firstName}}: sapaan nama depan anggota.
- {{electionTitle}}: judul pemilihan.
- {{voterId}}: ID pemilih; wajib ada dalam isi email.
- {{votingLink}}: tautan pribadi; wajib ada dalam isi email.
- {{opensAt}} dan {{closesAt}}: jadwal dalam waktu Brisbane.

Klik Preview email — does not send / Pratinjau email — tidak mengirim. Preview memakai contoh anggota dan tautan EXAMPLE, sehingga tidak memberikan akses suara sungguhan.

## 6. Publish dan kirim undangan
1. Klik Save draft. Pastikan nama kandidat, jadwal, dan jumlah penerima benar.
2. Di bagian Publish, centang konfirmasi bahwa seluruh anggota yang ditandai sudah membayar, berhak memilih, dan tidak tercatat ganda.
3. Klik Publish & send invitations / Publish & kirim undangan.
4. Baca dialog konfirmasi jumlah penerima. Lanjutkan hanya apabila siap mengirim undangan sungguhan.
5. Website mengunci draft, membuat hak pilih unik, lalu memproses email di server. Tab browser boleh ditutup.

Email dikirim terpisah untuk setiap alamat melalui layanan email website yang sudah ada. Anggota dengan Gmail maupun penyedia email lain dapat menerima undangan. Daftar alamat tidak dimasukkan ke CC atau BCC bersama.

Jika publish dilakukan sebelum jadwal buka, undangan langsung dikirim, tetapi pemilih baru dapat mengirim suara ketika jadwal buka tiba. Membuka email tidak menghabiskan hak pilih. Hanya pengiriman suara final yang menggunakannya.

[SCREENSHOT:admin-publish.png]

<!-- pagebreak -->
# Pantau pengiriman dan partisipasi
## 7. Baca status email
Klik Refresh / Muat ulang untuk status terbaru. Halaman tidak melakukan polling terus-menerus.
- QUEUED: undangan berada dalam antrean.
- SENDING: server sedang memproses batch undangan.
- SENT / Accepted by email service: penyedia email menerima permintaan. Ini bukan jaminan pesan sudah masuk inbox.
- FAILED: terjadi kegagalan. Kode singkat membantu pengelola memeriksa konfigurasi atau batas pengiriman.

Website mencoba ulang satu kali untuk kegagalan sementara. Jika masih gagal atau pekerjaan terputus, klik Resume / retry failed invitations. Antrean yang sedang aktif tidak dikirim ulang secara bersamaan; pekerjaan terputus dapat diambil kembali setelah lease sekitar dua menit berakhir.

## Anggota belum menerima email
1. Minta anggota memeriksa Spam, Promotions, dan alamat yang terdaftar.
2. Jika status gagal atau masih antre, gunakan Resume / retry.
3. Jika status sudah diterima penyedia tetapi email hilang, gunakan Resend invitation / Kirim ulang undangan pada baris anggota yang belum memilih.
4. Pengiriman ulang memakai tautan dan hak pilih yang sama. Tidak membuat hak pilih kedua dan tidak mengubah alamat penerima yang dibekukan.
5. Tombol kirim ulang tidak tersedia setelah anggota memilih. Jika pengiriman sebelumnya masih tidak pasti, email yang sama dapat diterima dua kali; keduanya tetap hanya memberikan satu hak pilih.

Jangan meminta anggota meneruskan tautan rahasianya kepada panitia. Untuk masalah kredensial atau alamat yang salah setelah publish, hentikan proses dan hubungi pengelola sistem. Jangan mengubah data pemilihan langsung lewat database.

## 8. Pantau tanpa melihat pilihan
Daftar pemilih menampilkan sudah/belum memilih, tanpa pilihan kandidat. Selama voting berjalan, hanya total partisipasi yang ditampilkan; jumlah per kandidat disembunyikan untuk mengurangi kemungkinan menebak pilihan dari perubahan hasil langsung.

<!-- pagebreak -->
# Tutup, hasil, dan batas privasi
## 9. Menutup dan membaca hasil
Voting menolak kiriman baru setelah batas waktu, walaupun halaman pengguna masih terbuka. Admin dapat memakai Close voting now untuk menutup lebih awal; tindakan ini perlu konfirmasi dan tidak dapat dibuka ulang dari antarmuka.

Setelah waktu habis atau ditutup, muat ulang halaman. Bagian Final results menampilkan jumlah suara setiap kandidat, abstain, dan total suara. Download results CSV mengunduh hasil agregat, tanpa pasangan identitas dan pilihan. Panitia tetap harus memverifikasi hasil, menangani seri, dan mengumumkan keputusan sesuai aturan organisasi. Sistem tidak menunjuk pemenang secara otomatis saat seri.

## Menghapus dan membatalkan
- Delete draft hanya tersedia untuk DRAFT. Draft beserta tag dan kandidatnya dihapus tanpa mengirim email.
- Pemilihan yang sudah dipublish tidak dapat diedit atau dihapus melalui admin.
- Cancel election menghentikan voting dan menjaga catatan yang sudah masuk. Hasil pemilihan yang dibatalkan hanya menjadi catatan.
- Suara yang sudah dikirim tidak dapat diubah, dihapus per anggota, atau dipindahkan ke kandidat lain.

## Apa yang dilindungi
Identitas pemilih dan status sudah memilih disimpan terpisah dari pilihan suara. Tabel suara tidak menyimpan ID anggota, ID pemilih, email, token, IP, sesi, atau waktu kirim per suara. Aplikasi tidak memberikan tampilan yang memasangkan nama anggota dengan pilihannya.

Ini bukan anonimitas kriptografis terhadap pemilik database/server. Pengelola dengan akses database, metadata transaksi, atau log dapat mengorelasikan aktivitas. Batasi akses tersebut dan gunakan penyelenggara voting independen jika pemilihan membutuhkan perlindungan dari operator sistem sendiri. Tautan rahasia juga tidak mencegah penerima meneruskannya; siapa pun yang memegang tautan dapat memakainya lebih dahulu.

## Catatan pengelola sistem
Migrasi database pemilihan harus diterapkan sebelum fitur digunakan. Tabel pemilihan memakai row-level security; akses data berjalan melalui server. Layanan Brevo harus dikonfigurasi dan memiliki kuota pengiriman yang cukup. Pertahankan AUTH_SECRET dan ELECTION_TOKEN_SECRET yang stabil; jika belum disetel, sistem memakai kredensial server privat yang sudah ada sebagai fallback. Jangan merotasi kunci token selama pemilihan berjalan. Kode TOKEN_SECRET_CHANGED berarti konfigurasi kunci berbeda dari saat publish dan harus dipulihkan oleh pengelola.

Dukungan panitia: qld@ppi-australia.org.
