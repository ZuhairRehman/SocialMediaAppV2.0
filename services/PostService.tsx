import { supabase } from '@/libs/supabase';
import { uploadFile } from './ImageService';

//Create or Update Post Service for saving posts to server
export const createorUpdatePost = async post => {
    try {
        //upload image
        if (post.file && typeof post.file === 'object') {
            let isImage = post?.file?.type === 'image';
            let folderName = isImage ? 'postImages' : 'postVideos';
            let fileResult = await uploadFile(folderName, post?.file?.uri, isImage);
            if (fileResult.success) post.file = fileResult.data;
            else return fileResult;
        }
        const { data, error } = await supabase.from('posts').upsert(post).select().single();
        return { success: true, data: data };
    } catch (error) {
        console.log('Post failed');
        return { success: false, message: 'Post failed' };
    }
};

//Fetch Service for post data from server
export const fetchPosts = async (limit = 10, userId) => {
    try {
        if (userId) {
            const { data, error } = await supabase
                .from('posts')
                .select(
                    `
                *,
                user: users (id, name, image),
                post_likes (*),
                comments (count)
                `,
                )
                .order('created_at', { ascending: false })
                .eq('userId', userId)
                .limit(limit);
            return { success: true, data: data };
        } else {
            const { data, error } = await supabase
                .from('posts')
                .select(
                    `
                *,
                user: users (id, name, image),
                post_likes (*),
                comments (count)
                `,
                )
                .order('created_at', { ascending: false })
                .limit(limit);
            return { success: true, data: data };
        }
    } catch (error) {
        console.log('fetched posts failed', error);
        return { success: false, message: 'Could not retrieve the posts' };
    }
};

//Fetch Service for post details modal, from server
export const fetchPostDetails = async postId => {
    try {
        const { data, error } = await supabase
            .from('posts')
            .select(
                `
                *,
                user: users (id, name, image),
                post_likes (*),
                comments (*, user: users(id, name, image)) 
                `,
            )
            .eq('id', postId)
            .order('created_at', { ascending: false, foreignTable: 'comments' })
            .single();

        return { success: true, data: data };
    } catch (error) {
        console.log('fetching post details failed', error);
        return { success: false, message: 'Could not retrieve the post' };
    }
};

//Create a post like service
export const createPostLike = async postLike => {
    try {
        const { data, error } = await supabase
            .from('post_likes')
            .insert(postLike)
            .select()
            .single();

        if (error) {
            console.log('fetched posts failed', error);
            return { success: false, message: 'Could not like the post' };
        }
        return { success: true, data: data };
    } catch (error) {
        console.log('fetched posts failed', error);
        return { success: false, message: 'Could not like the post' };
    }
};

//Remove post like service
export const removePostLike = async (postId, userId) => {
    try {
        const { error } = await supabase
            .from('post_likes')
            .delete()
            .eq('postId', postId)
            .eq('userId', userId);
        if (error) {
            return { success: false, message: 'Could not unlike' };
        }

        return { success: true };
    } catch (error) {
        console.log('fetched posts failed', error);
        return { success: false, message: 'Could not unlike' };
    }
};

//Create a comment service
export const createComment = async comment => {
    try {
        const { data, error } = await supabase.from('comments').insert(comment).select().single();
        return { success: true, data: data };
    } catch (error) {
        console.log('comment error', error);
        return { success: false, message: 'Could not post comment' };
    }
};

//Delete a comment service
export const removeComment = async commentId => {
    try {
        const { error } = await supabase.from('comments').delete().eq('id', commentId);
        if (error) {
            console.log('comment delete error', error);
            return { success: false, message: 'Could not delete comment' };
        }
        return { success: true, data: { commentId } };
    } catch (error) {
        console.log('comment delete error', error);
        return { success: false, message: 'Could not delete comment' };
    }
};

// Delete a post service
export const removePost = async postId => {
    try {
        const { error } = await supabase.from('posts').delete().eq('id', postId);
        if (error) {
            console.log('post delete error', error);
            return { success: false, message: 'Could not delete post' };
        }
        return { success: true, data: { postId } };
    } catch (error) {
        console.log('post delete error', error);
        return { success: false, message: 'Could not delete post' };
    }
};
