// ================================================
// Rich Text Editor Component
// ================================================
// Simple rich text editor with markdown formatting
// Supports:
// - **bold text** for narration emphasis
// - > dialogue for character speech
// ================================================

import React, { useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Bold, Quote } from "lucide-react";

interface RichTextEditorProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	label?: string;
	className?: string;
	rows?: number;
}

export function RichTextEditor({
	value,
	onChange,
	placeholder = "Escribe aquí...",
	label,
	className = "",
	rows = 8,
}: RichTextEditorProps) {
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	/**
	 * Insert markdown formatting around selected text
	 */
	const insertFormatting = (before: string, after: string = before) => {
		const textarea = textareaRef.current;
		if (!textarea) return;

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const selectedText = value.substring(start, end);
		const beforeText = value.substring(0, start);
		const afterText = value.substring(end);

		const newText = `${beforeText}${before}${selectedText}${after}${afterText}`;
		onChange(newText);

		// Restore focus and selection
		setTimeout(() => {
			textarea.focus();
			textarea.setSelectionRange(
				start + before.length,
				end + before.length
			);
		}, 0);
	};

	/**
	 * Make selected text bold (**text**)
	 */
	const makeBold = () => {
		insertFormatting("**");
	};

	/**
	 * Format selected text as dialogue (> text)
	 */
	const makeDialogue = () => {
		const textarea = textareaRef.current;
		if (!textarea) return;

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;

		// Find the start of the current line
		const beforeText = value.substring(0, start);
		const lastNewline = beforeText.lastIndexOf("\n");
		const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;

		// Check if line already starts with >
		if (value.substring(lineStart, lineStart + 2) === "> ") {
			// Remove the >
			const newText =
				value.substring(0, lineStart) +
				value.substring(lineStart + 2);
			onChange(newText);

			setTimeout(() => {
				textarea.focus();
				textarea.setSelectionRange(start - 2, end - 2);
			}, 0);
		} else {
			// Add > at the start of the line
			const newText =
				value.substring(0, lineStart) +
				"> " +
				value.substring(lineStart);
			onChange(newText);

			setTimeout(() => {
				textarea.focus();
				textarea.setSelectionRange(start + 2, end + 2);
			}, 0);
		}
	};

	return (
		<div className={`space-y-2 ${className}`}>
			{label && (
				<label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
					{label}
				</label>
			)}

			{/* Formatting toolbar */}
			<div className="flex gap-2 border-b pb-2">
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={makeBold}
					title="Negrita (narrará al grupo)"
				>
					<Bold className="h-4 w-4" />
				</Button>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={makeDialogue}
					title="Diálogo"
				>
					<Quote className="h-4 w-4" />
				</Button>
				<div className="ml-auto text-xs text-muted-foreground flex items-center">
					<span className="mr-2">**negrita**</span>
					<span>&gt; diálogo</span>
				</div>
			</div>

			{/* Textarea */}
			<Textarea
				ref={textareaRef}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				rows={rows}
				className="font-mono text-sm"
			/>

			{/* Preview (if there's content) */}
			{value && (
				<div className="border rounded-md p-3 bg-muted/30">
					<div className="text-xs font-semibold text-muted-foreground mb-2">
						Vista previa:
					</div>
					<FormattedText text={value} />
				</div>
			)}
		</div>
	);
}

/**
 * Component to render formatted text
 */
interface FormattedTextProps {
	text: string;
	className?: string;
}

export function FormattedText({ text, className = "" }: FormattedTextProps) {
	const lines = text.split("\n");

	return (
		<div className={`space-y-2 ${className}`}>
			{lines.map((line, index) => {
				// Dialogue (> text)
				if (line.trim().startsWith("> ")) {
					const dialogue = line.substring(line.indexOf("> ") + 2);
					return (
						<div
							key={index}
							className="border-l-4 border-primary pl-3 py-1 italic bg-primary/5"
						>
							{renderInlineFormatting(dialogue)}
						</div>
					);
				}

				// Regular text
				return (
					<div key={index}>
						{renderInlineFormatting(line)}
					</div>
				);
			})}
		</div>
	);
}

/**
 * Render inline formatting (bold)
 */
function renderInlineFormatting(text: string): React.ReactNode {
	const parts: React.ReactNode[] = [];
	let current = "";
	let inBold = false;
	let i = 0;

	while (i < text.length) {
		if (text[i] === "*" && text[i + 1] === "*") {
			// Toggle bold
			if (current) {
				parts.push(
					inBold ? (
						<strong key={parts.length} className="font-bold text-primary">
							{current}
						</strong>
					) : (
						<span key={parts.length}>{current}</span>
					)
				);
				current = "";
			}
			inBold = !inBold;
			i += 2;
		} else {
			current += text[i];
			i++;
		}
	}

	// Push remaining text
	if (current) {
		parts.push(
			inBold ? (
				<strong key={parts.length} className="font-bold text-primary">
					{current}
				</strong>
			) : (
				<span key={parts.length}>{current}</span>
			)
		);
	}

	return parts.length > 0 ? parts : text;
}
