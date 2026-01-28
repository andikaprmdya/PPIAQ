import { Language } from './types';

export const translations = {
  navigation: {
    home: { id: 'Beranda', en: 'Home' },
    about: { id: 'Tentang Kami', en: 'About' },
    membership: { id: 'Keanggotaan', en: 'Membership' },
    pestaRakyat: { id: 'Pesta Rakyat', en: 'Pesta Rakyat' },
    contact: { id: 'Kontak', en: 'Contact' },
    login: { id: 'Masuk', en: 'Sign In' },
    register: { id: 'Daftar', en: 'Sign Up' },
  },
  home: {
    welcome: {
      title: { id: 'Selamat datang!', en: 'Welcome!' },
      subtitle: {
        id: 'Menghubungkan pelajar Indonesia di seluruh Queensland dengan peluang dan satu sama lain',
        en: 'Connecting Indonesian students all over Queensland to opportunities, and to each other',
      },
    },
    mission: {
      title: { id: 'Misi Kami', en: 'Our Mission' },
      description: {
        id: 'PPIA Queensland adalah sumber daya komunitas bagi pelajar Indonesia, tempat Anda dapat menemukan teman, peluang, dan dukungan akademik.',
        en: 'PPIA Queensland is a community resource for Indonesian students, where you can find friends, opportunities, and academic support.',
      },
    },
    cta: {
      guideBook: { id: 'Panduan Queensland', en: 'Guide to Queensland' },
      joinDatabase: { id: 'Tambahkan Saya ke Database', en: 'Add Me to Database' },
      joinMembership: { id: 'Saya Ingin Menjadi Anggota', en: 'I Want to Become a Member' },
    },
    stayInTouch: {
      title: { id: 'Tetap Terhubung', en: 'Stay in Touch' },
      description: {
        id: 'Berlangganan newsletter kami untuk mendapatkan update dan informasi terbaru',
        en: 'Subscribe to our newsletter for the latest updates and information',
      },
    },
  },
  about: {
    title: { id: 'Tentang Kami', en: 'About Us' },
    description: {
      id: 'Perhimpunan Pelajar Indonesia di Australia -- Queensland (PPIA Queensland) adalah organisasi siswa Indonesia yang dinamis',
      en: 'The Indonesian Student Association in Australia - Queensland Chapter (PPIA Queensland) is a dynamic organization',
    },
    branches: {
      title: { id: 'Cabang Universitas', en: 'University Branches' },
    },
    team: {
      title: { id: 'Tim Kami', en: 'Our Team' },
      description: {
        id: 'Mereka yang memimpin PPIA Queensland',
        en: 'Those who lead PPIA Queensland',
      },
    },
  },
  membership: {
    title: { id: 'Keanggotaan', en: 'Membership' },
    description: {
      id: 'Anggota mendapatkan harga eksklusif untuk acara bertiket kami, akses awal ke kalender program kami, dan akses penuh ke papan komunitas kami.',
      en: 'Members receive exclusive prices to our ticketed events, early access to our program calendar, and all-access to our community board.',
    },
    ordinary: {
      title: { id: 'Keanggotaan Biasa', en: 'Ordinary Membership' },
      description: {
        id: 'Untuk warga negara Indonesia yang belajar di Queensland',
        en: 'For Indonesian citizens studying in Queensland',
      },
      price: { id: '$10 AUD', en: '$10 AUD' },
    },
    associate: {
      title: { id: 'Keanggotaan Asosiasi', en: 'Associate Membership' },
      description: {
        id: 'Untuk warga non-Indonesia dengan warisan Indonesia yang belajar di Queensland',
        en: 'For non-Indonesian citizens with Indonesian heritage studying in Queensland',
      },
      price: { id: '$10 AUD', en: '$10 AUD' },
    },
  },
  pestaRakyat: {
    title: { id: 'Pesta Rakyat', en: 'Pesta Rakyat' },
    subtitle: {
      id: 'Perayaan Hari Kemerdekaan Indonesia Terbesar di Queensland',
      en: "Queensland's Largest Indonesian Independence Day Celebration",
    },
    description: {
      id: 'Pesta Rakyat adalah perayaan budaya Indonesia yang menampilkan musik, makanan, dan perayaan nasional sambil memperkuat hubungan komunitas di antara diaspora Indonesia Queensland.',
      en: 'Pesta Rakyat is an Indonesian cultural celebration showcasing music, food, and national celebrations while strengthening community connections within Queensland\'s Indonesian diaspora.',
    },
    volunteer: {
      title: { id: 'Bergabunglah dengan Tim Kami', en: 'Join Our Team' },
      description: {
        id: 'PPIA Queensland mencari tim acara untuk menjalankan Pesra di 2026. Tertarik?',
        en: 'PPIA Queensland is looking for an events team to run Pesra in 2026. Interested?',
      },
      button: { id: 'Daftar Sebagai Relawan', en: 'Volunteer' },
    },
  },
  contact: {
    title: { id: 'Hubungi Kami', en: 'Contact Us' },
    form: {
      name: { id: 'Nama', en: 'Name' },
      email: { id: 'Email', en: 'Email' },
      message: { id: 'Pesan', en: 'Message' },
      submit: { id: 'Kirim', en: 'Send' },
      success: {
        id: 'Terima kasih telah menghubungi kami!',
        en: 'Thank you for contacting us!',
      },
    },
  },
  auth: {
    login: {
      title: { id: 'Masuk', en: 'Sign In' },
      email: { id: 'Email', en: 'Email' },
      password: { id: 'Kata Sandi', en: 'Password' },
      submit: { id: 'Masuk', en: 'Sign In' },
      noAccount: {
        id: 'Belum memiliki akun?',
        en: "Don't have an account?",
      },
      register: { id: 'Daftar di sini', en: 'Register here' },
      error: { id: 'Email atau kata sandi tidak valid', en: 'Invalid email or password' },
    },
    register: {
      title: { id: 'Daftar', en: 'Sign Up' },
      step1: {
        title: { id: 'Informasi Pribadi', en: 'Personal Information' },
        description: { id: 'Beritahu kami tentang diri Anda', en: 'Tell us about yourself' },
        firstName: { id: 'Nama Depan', en: 'First Name' },
        lastName: { id: 'Nama Belakang', en: 'Last Name' },
        email: { id: 'Email', en: 'Email' },
      },
      step2: {
        title: { id: 'Setup Akun', en: 'Account Setup' },
        description: { id: 'Buat akun Anda', en: 'Create your account' },
        username: { id: 'Nama Pengguna', en: 'Username' },
        password: { id: 'Kata Sandi', en: 'Password' },
        confirmPassword: { id: 'Konfirmasi Kata Sandi', en: 'Confirm Password' },
      },
      step3: {
        title: { id: 'Informasi Keanggotaan', en: 'Membership Information' },
        description: { id: 'Pilih jenis keanggotaan Anda', en: 'Choose your membership type' },
        membershipType: { id: 'Jenis Keanggotaan', en: 'Membership Type' },
        university: { id: 'Universitas', en: 'University' },
        ordinary: { id: 'Biasa', en: 'Ordinary' },
        associate: { id: 'Asosiasi', en: 'Associate' },
      },
      submit: { id: 'Daftar', en: 'Sign Up' },
      success: { id: 'Pendaftaran Berhasil!', en: 'Registration Successful!' },
      alreadyHave: { id: 'Sudah punya akun?', en: 'Already have an account?' },
      login: { id: 'Masuk di sini', en: 'Sign in here' },
    },
  },
  footer: {
    copyright: { id: '© 2024 PPIA Queensland. Semua hak dilindungi.', en: '© 2024 PPIA Queensland. All rights reserved.' },
    followUs: { id: 'Ikuti Kami', en: 'Follow Us' },
  },
};

export function getTranslation(
  obj: any,
  lang: Language
): string {
  if (typeof obj === 'string') return obj;
  if (obj && typeof obj === 'object' && lang in obj) {
    return obj[lang];
  }
  return '';
}
