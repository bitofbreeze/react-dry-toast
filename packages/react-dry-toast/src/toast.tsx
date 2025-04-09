import {
	type FunctionComponent,
	useCallback,
	useEffect,
	useState,
	useSyncExternalStore,
} from "react";

type ToastHandlers = ReturnType<typeof useAutoClose>["handlers"];

// Require consumer to at least support 4 handlers we use for autoClose
// And let consumer access onClose if they want a close button or add onClose behavior
interface ToastProps extends ToastHandlers {
	onClose: () => void;
}

type ToastData = {
	id: number;
	component: FunctionComponent<ToastProps>;
	timeout?: number;
};

// https://react.dev/reference/react/useSyncExternalStore#subscribing-to-an-external-store
let nextId = 0;
let toasts: ToastData[] = [];
let listeners: (() => void)[] = [];
function emitChange() {
	for (const listener of listeners) {
		listener();
	}
}
const toastStore = {
	addToast(component: FunctionComponent<ToastProps>, timeout?: number) {
		const id = nextId++;
		toasts = [...toasts, { id, component, timeout }];
		emitChange();
		return id;
	},
	removeToast(id: number) {
		toasts = toasts.filter((toast) => toast.id !== id);
		emitChange();
	},
	subscribe(listener: () => void) {
		listeners = [...listeners, listener];
		return () => {
			listeners = listeners.filter((l) => l !== listener);
		};
	},
	getSnapshot() {
		return toasts;
	},
};

export const toast = Object.assign(toastStore.addToast, {
	dismiss: toastStore.removeToast,
});

export const Toaster = () => {
	const toasts = useSyncExternalStore(
		toastStore.subscribe,
		toastStore.getSnapshot,
		toastStore.getSnapshot,
	);

	return (
		<>
			{toasts.map((toast) => (
				<Toast key={toast.id} {...toast} />
			))}
		</>
	);
};

const noOp = () => {};

// Need to make all props stable (onClose can't be naked callback) because then other toasts entering/exiting cause another to rerender with bug: pausing one by mouseenter and entering a new one, when that new one exits, it causes old one to rerender and hence have a new timeout that exits it.
const Toast = ({ component, id, timeout = 7000 }: ToastData) => {
	const Component = component;
	const remove = useCallback(() => toastStore.removeToast(id), [id]);
	// Don't need to make handlers stable inside useAutoClose because inputs to this hook are stable
	const { handlers } = useAutoClose(timeout ? remove : noOp, timeout);

	return <Component onClose={remove} {...handlers} />;
};

export const useAutoClose = (onClose: () => void, timeout?: number) => {
	const [autoClose, setAutoClose] = useState<{
		timer: NodeJS.Timeout | null;
	}>();

	// Auto-start timeout on mount
	// biome-ignore lint/correctness/useExhaustiveDependencies:
	useEffect(() => {
		if (autoClose === undefined) {
			const timer = setTimeout(onClose, timeout);
			setAutoClose({ timer });
		}

		return () => {
			// Need to exclude autoClose from dependency array because causing effect to rerun upon unmount causes infinite loop
			// Also setting autoClose never necessitates doing anything after
			setAutoClose((prev) => {
				if (prev?.timer) {
					clearTimeout(prev.timer);
				}
				return undefined;
			});
		};
	}, [onClose]);

	// Set timer to null instead of autoClose=undefined to not resume in mount effect in case it runs
	const pauseTimeout = () => {
		// console.log("paused", autoClose?.timer);
		if (autoClose?.timer) {
			clearTimeout(autoClose.timer);
			setAutoClose({ timer: null });
		}
	};

	const resumeTimeout = () => {
		// console.log("resumed");
		setAutoClose({ timer: setTimeout(onClose, timeout) });
	};

	return {
		// Also export these if consumer wants to do something custom
		// pauseTimeout,
		// resumeTimeout,
		// TODO: If was hovering, then tabbed to focus, then mouseleave, timeout gets set and dismisses toast
		handlers: {
			onFocus: pauseTimeout,
			onBlur: resumeTimeout,
			onMouseEnter: pauseTimeout,
			onMouseLeave: resumeTimeout,
		},
	};
};
