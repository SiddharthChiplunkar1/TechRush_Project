import { ShieldCheck } from "lucide-react";

const Logo = () => {
  return (
    <div className="flex items-center gap-3 cursor-pointer">

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500">

        <ShieldCheck size={22} />

      </div>

      <div>

        <h2 className="text-xl font-bold">

          Tech<span className="text-orange-500">Rush</span>

        </h2>

        <p className="text-xs text-zinc-400">

          Passwordless Banking

        </p>

      </div>

    </div>
  );
};

export default Logo;