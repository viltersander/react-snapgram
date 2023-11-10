import { useDeleteSavedPost, useGetCurrentUser, useLikePost, useSavePost } from "@/lib/react-query/queries";
import { checkIsLiked } from "@/lib/utils";
import { Models } from "appwrite"
import React, { useEffect, useState } from "react";
import Loader from "./Loader";

type PostStatsProps = {
    post?: Models.Document;
    userId: string;
}

const PostStats = ({ post, userId }: PostStatsProps) => {
    // current likes 
    const likesList = post?.likes.map((user: Models.Document) => user.$id)

    const [likes, setLikes] = useState<string[]>(likesList)
    const [isSaved, setIsSaved] = useState(false);

    const { mutate: likePost } = useLikePost();
    const { mutate: savePost, isPending: isSavingPost } = useSavePost();
    const { mutate: deleteSavePost, isPending: isDeletingSave } = useDeleteSavedPost();

    // current logged in user
    const { data: currentUser } = useGetCurrentUser();

    // find saved post with likes
    const savedPostRecord = currentUser?.save.find((record: Models.Document) => record.post.$id === post?.$id);

    useEffect(() => {
        setIsSaved(!!savedPostRecord)
    }, [currentUser])

    const handleLikePost = (e: React.MouseEvent) => {
        e.stopPropagation();

        let likesArray = [...likes];

        if(likesArray.includes(userId)) {
            // like is removed
            likesArray = likesArray.filter((id) => id !== userId);
        } else {
            // like added 
            likesArray.push(userId);
        }

        setLikes(likesArray);
        likePost({ postId: post?.$id || '', likesArray})
    }

    const handleSavePost = (e: React.MouseEvent) => {
        e.stopPropagation();

        if(savedPostRecord) {
            setIsSaved(false);
            deleteSavePost(savedPostRecord.$id);
        } else {
            savePost({ postId: post?.$id || '', userId })
            setIsSaved(true);
        }
    }

  return (
    <div className="flex justify-between items-center z-20">
        <div className="flex gap-2 mr-5">
            <img 
                src={checkIsLiked(likes, userId) 
                    ? "/assets/icons/liked.svg"
                    : "/assets/icons/like.svg"
                }
                alt="like"
                width={20}
                height={20}
                onClick={handleLikePost}
                className="cursor-pointer"
            />
            <p className="small-medium lg:base-medium">{likes.length}</p>
        </div>

        <div className="flex gap-2">
            {isSavingPost || isDeletingSave ? <Loader /> : <img 
                    src={isSaved 
                        ? "/assets/icons/saved.svg" 
                        : "/assets/icons/save.svg"
                    }
                    alt="like"
                    width={20}
                    height={20}
                    onClick={handleSavePost}
                    className="cursor-pointer"
                />
            }
        </div>
    </div>
  )
}

export default PostStats