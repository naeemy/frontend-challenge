import { renderWithProviders, screen } from "../../utils/test-utils";
import { Input } from "@/components/ui";

describe("Input Component", () => {
  it("renders input with placeholder", () => {
    renderWithProviders(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  it("handles value changes", async () => {
    const handleChange = jest.fn();
    const { user } = renderWithProviders(<Input onChange={handleChange} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "test input");

    expect(handleChange).toHaveBeenCalled();
    expect(input).toHaveValue("test input");
  });

  it("displays label when provided", () => {
    renderWithProviders(<Input label="Test Label" />);
    expect(screen.getByText("Test Label")).toBeInTheDocument();
  });

  it("shows error message", () => {
    renderWithProviders(<Input error="This field is required" />);
    expect(screen.getByText("This field is required")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveClass("border-red-300");
  });

  it("shows success message", () => {
    renderWithProviders(<Input success="Valid input" />);
    expect(screen.getByText("Valid input")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveClass("border-green-300");
  });

  it("renders with left icon", () => {
    renderWithProviders(
      <Input leftIcon={<span data-testid="left-icon">🔍</span>} />,
    );
    expect(screen.getByTestId("left-icon")).toBeInTheDocument();
  });

  it("renders with right icon", () => {
    renderWithProviders(
      <Input rightIcon={<span data-testid="right-icon">✓</span>} />,
    );
    expect(screen.getByTestId("right-icon")).toBeInTheDocument();
  });

  it("shows loading spinner when loading", () => {
    renderWithProviders(<Input loading />);
    expect(screen.getByRole("textbox")).toBeDisabled();
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("applies different sizes correctly", () => {
    const { rerender } = renderWithProviders(<Input size="sm" />);
    expect(screen.getByRole("textbox")).toHaveClass("h-8");

    rerender(<Input size="lg" />);
    expect(screen.getByRole("textbox")).toHaveClass("h-12");
  });

  it("supports different input types", () => {
    const { rerender } = renderWithProviders(<Input type="email" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "email");

    rerender(<Input type="password" />);

    expect(screen.getByDisplayValue("")).toHaveAttribute("type", "password");
  });

  it("displays hint text", () => {
    renderWithProviders(<Input hint="This is a helpful hint" />);
    expect(screen.getByText("This is a helpful hint")).toBeInTheDocument();
  });
});
