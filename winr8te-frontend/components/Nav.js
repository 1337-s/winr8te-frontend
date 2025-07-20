import Link from "next/link";
import Image from "next/image";

export default function Nav() {
  return (
    <nav className="bg-background text-white flex w-screen justify-between items-center p-4">
      <div>
        <Link href="/">
          <Image
            src="/images/winr8te-icon.png"
            alt="WINR8TE Icon"
            width={48}
            height={48}
          />
        </Link>
      </div>
      <ul className="text-lg">
        <li>
          <Link href="/stats" className="link">
            Statistiques
          </Link>
        </li>
      </ul>
    </nav>
  );
}
