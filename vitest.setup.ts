import { vi } from "vitest";

vi.mock("@tanstack/react-start", () => {
  return {
    createServerFn: vi.fn().mockImplementation((options) => {
      const fn = async (input: any) => {
        if (!fn._handler) {
          throw new Error("No handler defined for createServerFn mock");
        }
        
        let validatedInput = input;
        if (fn._inputValidator) {
          if (typeof fn._inputValidator.parse === "function") {
            validatedInput = fn._inputValidator.parse(input);
          } else if (typeof fn._inputValidator === "function") {
            validatedInput = fn._inputValidator(input);
          }
        }
        
        return fn._handler({ data: validatedInput });
      };

      fn.inputValidator = vi.fn().mockImplementation((val) => {
        fn._inputValidator = val;
        return fn;
      });

      fn.handler = vi.fn().mockImplementation((hand) => {
        fn._handler = hand;
        return fn;
      });

      return fn;
    }),
  };
});
