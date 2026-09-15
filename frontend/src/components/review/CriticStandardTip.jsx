import Icon from "../common/Icon";

function CriticStandardTip() {
    return (
        <div className="bg-[#181c20] rounded-xl p-5 shadow-sm">
            <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#262a2f] flex items-center justify-center flex-shrink-0 text-[#43fe6d]">
                    <Icon className="text-[18px]">
                        verified
                    </Icon>
                </div>

                <div>
                    <div className="text-sm text-white font-semibold">
                        Critic Standard Tip
                    </div>

                    <p className="text-[13px] leading-[18px] text-[#99AABB] mt-1">
                        Mention specific technical crafts like sound design,
                        color grading, or production design to earn the
                        "Top Critique" community badge.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default CriticStandardTip;
