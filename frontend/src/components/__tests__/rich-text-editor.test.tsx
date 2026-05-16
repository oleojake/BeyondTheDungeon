import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RichTextEditor, FormattedText } from "../rich-text-editor";

describe("RichTextEditor", () => {
  const defaultProps = {
    value: "",
    onChange: vi.fn(),
  };

  it("renders the textarea with placeholder", () => {
    render(<RichTextEditor {...defaultProps} />);
    expect(
      screen.getByPlaceholderText("Escribe aquí..."),
    ).toBeTruthy();
  });

  it("renders formatting toolbar buttons", () => {
    render(<RichTextEditor {...defaultProps} />);
    expect(screen.getByTitle("Negrita (narrará al grupo)")).toBeTruthy();
    expect(screen.getByTitle("Diálogo")).toBeTruthy();
  });

  it("shows the label when provided", () => {
    render(<RichTextEditor {...defaultProps} label="Descripción" />);
    expect(screen.getByText("Descripción")).toBeTruthy();
  });

  it("does not render label when not provided", () => {
    const { container } = render(<RichTextEditor {...defaultProps} />);
    const labels = container.querySelectorAll("label");
    expect(labels.length).toBe(0);
  });

  it("renders markdown hint text", () => {
    render(<RichTextEditor {...defaultProps} />);
    expect(screen.getByText("**negrita**")).toBeTruthy();
    expect(screen.getByText("> diálogo")).toBeTruthy();
  });

  it("calls onChange when text is typed", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RichTextEditor {...defaultProps} onChange={onChange} />);

    const textarea = screen.getByPlaceholderText("Escribe aquí...");
    await user.type(textarea, "Hola");

    expect(onChange).toHaveBeenCalled();
  });

  it("applies custom className", () => {
    const { container } = render(
      <RichTextEditor {...defaultProps} className="custom-class" />,
    );
    expect(
      container.querySelector(".custom-class"),
    ).toBeTruthy();
  });

  it("uses custom placeholder", () => {
    render(
      <RichTextEditor
        {...defaultProps}
        placeholder="Escribe tu historia..."
      />,
    );
    expect(
      screen.getByPlaceholderText("Escribe tu historia..."),
    ).toBeTruthy();
  });

  it("uses custom rows", () => {
    render(<RichTextEditor {...defaultProps} rows={4} />);
    const textarea = screen.getByPlaceholderText(
      "Escribe aquí...",
    ) as HTMLTextAreaElement;
    expect(textarea.rows).toBe(4);
  });

  it("wraps selected text with ** on bold button click", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RichTextEditor value="hola mundo" onChange={onChange} />);

    const boldBtn = screen.getByTitle("Negrita (narrará al grupo)");
    await user.click(boldBtn);

    expect(onChange).toHaveBeenCalledWith("****hola mundo");
  });

  it("toggles > on dialogue button click", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RichTextEditor value="hola mundo" onChange={onChange} />);

    const dialogueBtn = screen.getByTitle("Diálogo");
    await user.click(dialogueBtn);

    expect(onChange).toHaveBeenCalledWith("> hola mundo");
  });

  it("shows preview when value is present", () => {
    render(<RichTextEditor {...defaultProps} value="**test**" />);
    expect(screen.getByText("Vista previa:")).toBeTruthy();
  });

  it("hides preview when value is empty", () => {
    render(<RichTextEditor {...defaultProps} value="" />);
    expect(screen.queryByText("Vista previa:")).toBeNull();
  });
});

describe("FormattedText", () => {
  it("renders plain text", () => {
    render(<FormattedText text="hello world" />);
    expect(screen.getByText("hello world")).toBeTruthy();
  });

  it("renders bold text wrapped in **", () => {
    const { container } = render(
      <FormattedText text="this is **bold** text" />,
    );
    expect(container.querySelector("strong")).toBeTruthy();
  });

  it("renders dialogue lines prefixed with > ", () => {
    const { container } = render(
      <FormattedText text="> I speak" />,
    );
    const div = container.querySelector(".border-l-4");
    expect(div).toBeTruthy();
  });

  it("renders dialogue with bold text inside", () => {
    const { container } = render(
      <FormattedText text={"> **Dialogue bold**"} />,
    );
    expect(container.querySelector(".border-l-4")).toBeTruthy();
    expect(container.querySelector("strong")).toBeTruthy();
  });

  it("applies custom className", () => {
    const { container } = render(
      <FormattedText text="test" className="extra-class" />,
    );
    expect(container.querySelector(".extra-class")).toBeTruthy();
  });
});
