import Icon from "../common/Icon";

function ReviewActions() {
    return (
        <div className="mt-8 pt-6 bg-[#181c20] rounded-xl p-4 md:p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                <button
                    type="button"
                    className="px-4 py-2.5 rounded-lg bg-[#262a2f] hover:bg-[#2C3440] text-white text-sm flex items-center gap-2 transition-all"
                >
                    <Icon className="text-[18px]">
                        save
                    </Icon>
                    Save Draft
                </button>

                <button
                    type="button"
                    className="px-4 py-2.5 rounded-lg bg-[#262a2f] hover:bg-[#2C3440] text-white text-sm flex items-center gap-2 transition-all"
                >
                    <Icon className="text-[18px]">
                        visibility
                    </Icon>
                    Preview Review
                </button>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <span className="text-[13px] text-[#99AABB] hidden md:inline">
                    Ready to publish as{" "}
                    <strong className="text-white">
                        Alex Mercer
                    </strong>
                </span>

                <button
                    type="button"
                    className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#00e054] text-[#00390f] hover:bg-[#43fe6d] transition-all text-sm font-bold shadow-lg shadow-[#43fe6d]/20 flex items-center justify-center gap-2 transform active:scale-95"
                >
                    <Icon className="text-[20px]">
                        publish
                    </Icon>
                    Publish Review
                </button>
            </div>
        </div>
    );
}

export default ReviewActions;
