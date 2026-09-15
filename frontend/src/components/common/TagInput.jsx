import { useState } from "react";
import Icon from "./Icon";

function TagInput({ tags, setTags }) {
    const [tagInput, setTagInput] = useState("");

    const addTag = (e) => {
        if (e.key === "Enter" && tagInput.trim()) {
            const newTag = tagInput.trim().replace(/\s+/g, "");

            if (!tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }

            setTagInput("");
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter((tag) => tag !== tagToRemove));
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <label className="text-xs tracking-wider text-[#99AABB] uppercase">
                    Thematic Tags & Motifs
                </label>

                <span className="text-[13px] text-[#99AABB]">
                    Categorize for community discovery
                </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 p-3 bg-[#0B0D0F] rounded-lg">
                {tags.map((tag) => (
                    <span
                        key={tag}
                        className="px-2.5 py-1 rounded-full bg-[#262a2f] text-white text-[13px] flex items-center gap-1.5"
                    >
                        #{tag}

                        <button
                            type="button"
                            aria-label={`Remove ${tag}`}
                            onClick={() => removeTag(tag)}
                            className="hover:text-[#ffb4ab] transition-colors"
                        >
                            <Icon className="text-[14px]">
                                close
                            </Icon>
                        </button>
                    </span>
                ))}

                <div className="flex items-center gap-1">
                    <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={addTag}
                        placeholder="+ Add motif or keyword..."
                        className="bg-transparent text-white text-[13px] placeholder:text-[#99AABB]/60 focus:outline-none px-2 py-0.5"
                    />
                </div>
            </div>
        </div>
    );
}

export default TagInput;
