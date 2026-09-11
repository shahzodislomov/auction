import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    ".worktrees/**",
    "next-env.d.ts",
    // Confirmed dead Create React App entrypoints. The active app uses src/app.
    "src/pages/**",
    "src/App.jsx",
    "src/index.js",
    // Replaced legacy App Router screen trees. The Champagne Ledger routes use
    // the typed components under src/components/{admin,auction,auth,cabinet,...}.
    "src/app/(_components)/*.jsx",
    "src/app/(_components)/Admin/**",
    "src/app/(_components)/Bid/**",
    "src/app/(_components)/cabinet/**",
    "src/app/(_components)/auth/ForgotPassword.jsx",
    "src/app/(_components)/auth/Login.jsx",
    "src/app/(_components)/auth/LoginModal.jsx",
    "src/app/(_components)/auth/Register.jsx",
    "src/components/Home/**",
    "src/components/Lots/**",
    "src/components/Chat/**",
    "src/components/Support/**",
    "src/components/EditLotForm.jsx",
    "src/components/Header/Navbar.jsx",
    "src/components/SlickSlider.jsx",
    "src/queries/region.jsx",
  ]),
]);

export default eslintConfig;
