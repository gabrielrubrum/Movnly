import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: [
    /*
     * Intercepta todas as rotas exceto as estáticas, imagens, ícones e APIs:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (ex: .png, .jpg, .svg, .webmanifest)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webmanifest)$).*)",
  ],
};

export function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // Obtém o host da requisição (ex: admin.movnly.com, admin.localhost:3000)
  const hostname = req.headers.get("host") || "";

  // Define o domínio base. Ex: movnly.com (em produção)
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "movnly.com";

  // Remove a porta do host (útil para desenvolvimento local. Ex: localhost:3000 -> localhost)
  const currentHost = hostname.replace(/:\d+$/, "");

  let subdomain = "";

  // Extrai o subdomínio corretamente
  if (currentHost.endsWith(`.${rootDomain}`)) {
    subdomain = currentHost.replace(`.${rootDomain}`, "");
  } else if (currentHost.endsWith(".localhost")) {
    subdomain = currentHost.replace(".localhost", "");
  }

  // Se for o domínio raiz ou localhost limpo, não precisa reescrever a rota
  if (
    subdomain === rootDomain ||
    currentHost === rootDomain ||
    currentHost === "localhost" ||
    subdomain === ""
  ) {
    return NextResponse.next();
  }

  // Pega o caminho atual e a query string (ex: /login?ref=123)
  const pathname = url.pathname === "/" ? "" : url.pathname;
  const search = url.search;

  // Realiza o rewrite baseado no subdomínio detectado
  switch (subdomain) {
    case "admin":
      return NextResponse.rewrite(new URL(`/admin${pathname}${search}`, req.url));
    case "driver":
    case "drive":
      return NextResponse.rewrite(new URL(`/motorista${pathname}${search}`, req.url));
    case "partner":
      return NextResponse.rewrite(new URL(`/parceiros${pathname}${search}`, req.url));
    case "app":
      return NextResponse.rewrite(new URL(`/cliente${pathname}${search}`, req.url));
    default:
      // Se um subdomínio desconhecido for acessado, podemos apenas continuar, 
      // ou se você quiser, redirecionar para a raiz.
      return NextResponse.next();
  }
}
