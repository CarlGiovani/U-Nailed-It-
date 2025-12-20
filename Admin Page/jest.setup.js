// Silence dialogs in tests (your app uses alert/prompt in some flows)
global.alert = jest.fn();
global.prompt = jest.fn(() => "1234"); // default pin if needed

// Ensure location.hash exists in JSDOM
if (!global.location) {
  global.location = { hash: "" };
}
