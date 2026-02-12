<<<<<<< HEAD
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is currently not compatible with SWC. See [this issue](https://github.com/vitejs/vite-plugin-react/issues/428) for tracking the progress.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
=======
**Update tanggal 3 Januari 2026**

*Update ini termasuk update besar dengan beberapa poin - poin berikut:*

**A.Update halaman landing page / home**
1. logo dishub bergambar bus biru bertitle “Seulamat” yang interaktif (Ketika Mouse diarahkan, maka gambar akan bergerak)
2.3 card video dokumentasi mudik gratis tahun 2025
3.Informasi mudik gratis yang ke  direct langsung ke halaman https://dishub.acehprov.go.id

**B.Update Halaman Dashboard User**
1.Dashboard sekarang memiliki banner yang berisi foto2 momen mudik gratis 2025
2.Terdapat icon user di sudut kanan atas yang memiliki dropdown, dropdown akan mengarahkan ke 3 pilihan yang 2 dari pilihan tersebut mengarahkan ke halaman:
Tentang Program
Pusat Bantuan
4.Limitasi yang sebelumnya masih 20 sekarang mutlak 6 (Bug page integrasi daftar mudik dengan dashboard user belum di cek. Contoh: jika di dashboard 5 orang sudah terdaftar, maka di page daftar mudik hanya bisa menambah satu penumpang, tidak bisa lebih)
C.Halaman Bantuan
		Halaman ini bertujuan untuk membantu para user yang kebingungan dengan tata 	cara mendaftarkan mudik, apa yang dibutuhkan, dll. Tersedia pula nomor hp yang 	niatnya langsung ke hubung ke operator admin yang sedang bekerja

**D.Halaman Tentang Kami**
		Halaman ini bertujuan untuk user yang ingin tau sebenarnya web service ini 	bertujuan buat apa, serta melingkup rute - rute yang akan di kunjungi

**E.UI Page Login Admin**
	1.UI page login sebelumnya tidak mengikuti standar design yang sudah dikembangkan oleh 	frontend, jadinya kami melakukan perubahan langsung yang dimana Design mirip dengan 	halaman login user page dan register admin page.
>>>>>>> fd068c7bd5b702d1ebdef5cfb1c6d7e7253f6f70
