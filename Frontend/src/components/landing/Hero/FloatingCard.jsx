import GlassCard from "../../common/GlassCard/GlassCard";

import {

Shield,

ScanFace,

Fingerprint,

BrainCircuit

} from "lucide-react";

const FloatingCard = () => {

    return (

        <GlassCard className="w-95">

            <h2 className="mb-8 text-xl font-semibold">

                Security Overview

            </h2>

            <div className="space-y-6">

                <div>

                    <div className="flex justify-between">

                        <span>Security Score</span>

                        <span className="text-orange-500">

                            98%

                        </span>

                    </div>

                    <div className="mt-3 h-2 rounded-full bg-white/10">

                        <div className="h-full w-[98%] rounded-full bg-orange-500"/>

                    </div>

                </div>

                <div className="flex justify-between">

                    <div className="flex gap-3">

                        <Shield/>

                        JWT Protection

                    </div>

                    <span className="text-green-400">

                        Active

                    </span>

                </div>

                <div className="flex justify-between">

                    <div className="flex gap-3">

                        <ScanFace/>

                        Face Authentication

                    </div>

                    <span className="text-green-400">

                        Verified

                    </span>

                </div>

                <div className="flex justify-between">

                    <div className="flex gap-3">

                        <Fingerprint/>

                        Trusted Device

                    </div>

                    <span className="text-green-400">

                        Active

                    </span>

                </div>

                <div className="flex justify-between">

                    <div className="flex gap-3">

                        <BrainCircuit/>

                        AI Detection

                    </div>

                    <span className="text-orange-400">

                        Running

                    </span>

                </div>

            </div>

        </GlassCard>

    );

};

export default FloatingCard;