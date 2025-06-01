import { renderWithProviders, screen } from "../../utils/test-utils";
import { Button } from "@/components/ui";

describe("Button Component", () => {
  it("renders with children", () => {
    renderWithProviders(<Button>Click me</Button>);
    expect(
      screen.getByRole("button", { name: /click me/i }),
    ).toBeInTheDocument();
  });

  it("applies variant styles correctly", () => {
    renderWithProviders(<Button variant="primary">Primary</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-blue-600");
  });

  it("handles click events", async () => {
    const handleClick = jest.fn();
    const { user } = renderWithProviders(
      <Button onClick={handleClick}>Click me</Button>,
    );

    await user.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("shows loading state", () => {
    renderWithProviders(<Button loading>Loading</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();

    expect(button.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("disables button when disabled prop is true", () => {
    renderWithProviders(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("renders with left and right icons", () => {
    renderWithProviders(
      <Button
        leftIcon={<span data-testid="left-icon">L</span>}
        rightIcon={<span data-testid="right-icon">R</span>}
      >
        With Icons
      </Button>,
    );

    expect(screen.getByTestId("left-icon")).toBeInTheDocument();
    expect(screen.getByTestId("right-icon")).toBeInTheDocument();
  });

  it("applies different sizes correctly", () => {
    const { rerender } = renderWithProviders(<Button size="sm">Small</Button>);
    expect(screen.getByRole("button")).toHaveClass("h-8");

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole("button")).toHaveClass("h-12");
  });

  it("does not execute click handler when disabled", async () => {
    const handleClick = jest.fn();
    const { user } = renderWithProviders(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>,
    );

    await user.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });
});
