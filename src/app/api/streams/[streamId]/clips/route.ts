import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { stream, clip, uploadedClip, socialMediaHandle } from "@/db/schema/users";
import { eq, desc } from "drizzle-orm";

//done
const StreamIdSchema = z
	.string({
		required_error: "Stream ID is required",
		invalid_type_error: "Stream ID must be a string",
	})
	.trim()
	.uuid("Stream ID must be a valid UUID");

// type StreamParams = {
// 	params: {
// 		streamId: z.infer<typeof StreamIdSchema>;
// 	};
// };

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ streamId: string }> }
): Promise<NextResponse> {
	try {
		const { streamId } = await params;

		const streamValidation = StreamIdSchema.safeParse(streamId);
		if (!streamValidation.success) {
			return NextResponse.json(
				{
					confirmation: "fail",
					error: "Invalid stream ID",
					message: streamValidation.error.errors[0].message,
				},
				{ status: 400 }
			);
		}

		// First, verify the stream exists
		const streamCheck = await db
			.select()
			.from(stream)
			.where(eq(stream.stream_id, streamId));

		if (streamCheck.length === 0) {
			return NextResponse.json(
				{
					confirmation: "fail",
					error: "Stream not found",
				},
				{ status: 404 }
			);
		}

		// Fetch clips for the stream
		const clips = await db
			.select()
			.from(clip)
			.where(eq(clip.stream_id, streamId))
			.orderBy(desc(clip.created_at));

		if (clips.length === 0) {
			return NextResponse.json({
				confirmation: "success",
				message: "No clips found for this stream",
				data: [],
			});
		}

		// Fetch upload information for all clips
		const clipIds = clips.map(c => c.clip_id);
		const uploadsByClip = new Map<string, Array<{platform_id: number, upload_link: string | null, uploaded_at: Date | null}>>();

		// Fetch uploads for each clip individually
		for (const clipId of clipIds) {
			const clipUploads = await db
				.select({
					platform_id: socialMediaHandle.platform_id,
					upload_link: uploadedClip.upload_link,
					uploaded_at: uploadedClip.uploaded_at,
				})
				.from(uploadedClip)
				.innerJoin(socialMediaHandle, eq(uploadedClip.social_media_handle_id, socialMediaHandle.handle_id))
				.where(eq(uploadedClip.clip_id, clipId));

			if (clipUploads.length > 0) {
				uploadsByClip.set(clipId, clipUploads);
			}
		}

		// Combine clips with their upload information
		const clipsWithUploads = clips.map(clip => ({
			...clip,
			uploads: uploadsByClip.get(clip.clip_id) || [],
		}));

		return NextResponse.json({
			confirmation: "success",
			data: clipsWithUploads,
		});
	} catch (error) {
		console.error("Database error:", error);
		return NextResponse.json(
			{
				confirmation: "fail",
				error: "Failed to fetch clips",
			},
			{ status: 500 }
		);
	}
}
