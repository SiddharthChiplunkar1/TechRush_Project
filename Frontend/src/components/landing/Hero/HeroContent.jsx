import { ArrowRight } from "lucide-react";
import Button from "../../common/Button/Button";

const HeroContent = () => {

    return (

        <div>

            <div className="inline-flex items-center rounded-full border border-orange-500/30 px-5 py-2">

                AI Powered Passwordless Banking

            </div>

            <h1 className="mt-8 text-6xl font-bold leading-tight">

                Passwordless Banking

                <span className="block text-orange-500">

                    Powered by AI

                </span>

            </h1>

            <p className="mt-8 max-w-xl text-lg text-zinc-400">

                Experience secure banking using Face Authentication,
                Trusted Devices, Google OAuth and OTP verification.

            </p>

            <div className="mt-10 flex flex-wrap gap-5">

                <Button>

                    Get Started

                    <ArrowRight size={18} />

                </Button>

                <Button variant="secondary">

                    Live Demo

                </Button>

            </div>

        </div>

    );

};

export default HeroContent;