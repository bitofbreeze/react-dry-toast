# react-dry-toast

A simple headless toast queueing and auto-dismissing solution for React 18+. The toast comes out plain; you add your own toppings.

Other toast libraries do too much and end up with tons of bugs. react-dry-toast does what it needs to and leaves the styling up to you completely. As you can see in step 1, it doesn't even render a container, so you decide where it goes without any bloat.

## Getting started

1. Put your Toaster where you want your toasts come out of when they're ready:

```jsx
import { Toaster } from "react-dry-toast";

...

<ul className="z-50 fixed flex flex-col gap-1.5 bottom-4 left-4 max-w-[calc(100%-var(--spacing-8))]">
  <Toaster />
</ul>
```

2. Make some toast:

```jsx
import { toast } from "react-dry-toast";

...

toast((props) => <li {...props}>Dry</li>);
```

## Advanced

1. Toasts automatically have a 7-second timeout. You can remove it:

```jsx
import { toast } from "react-dry-toast";

...

toast((props) => <li {...props}>Dry</li>, 0);
```

2. You can put a "close" button in your toast:

```jsx
import { toast } from "react-dry-toast";

...

toast((props) => <li {...props}><button onClick={props.onClose}>Close</button></li>, 0);
```

3. If making toast in an effect, make sure to clean up for strict mode:

```jsx
import { toast } from "react-dry-toast";

...

useEffect(() => {
  const id = toast((props) => <li {...props}><button onClick={props.onClose}>Close</button></li>, 0);

  return () => toast.dismiss(id);
}, []);
```

## To do

- Add tests