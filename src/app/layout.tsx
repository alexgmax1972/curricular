import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
title: "P.A.C. - Plataforma de Atividade Curricular",
description: "Plataforma de Atividade Curricular",
};

interface RootLayoutProps {
children: React.ReactNode;
}

export default function RootLayout({
children,
}: RootLayoutProps) {
return ( <html lang="pt-BR"> <body>{children}</body> </html>
);
}
