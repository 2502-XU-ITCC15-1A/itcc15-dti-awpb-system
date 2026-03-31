import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import awpbTree from "../data/awpb_dropdown_tree.json"

const FALLBACK_VALUE = "N/A"

function findOtherOperatingPath(componentNode) {
    if (!componentNode || typeof componentNode !== "object") return null

    for (const [subComponentKey, keyActivities] of Object.entries(componentNode)) {
        if (!keyActivities || typeof keyActivities !== "object") continue

        for (const keyActivityKey of Object.keys(keyActivities)) {
            if (
                keyActivityKey
                    .toLowerCase()
                    .includes("other operating cost attributed to component")
            ) {
                return {
                    subComponentKey,
                    keyActivityKey,
                }
            }
        }
    }

    return null
}

export default function SubmitEntry() {
    const {
        register,
        handleSubmit,
        watch,
        resetField,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: {
            planningYear: "2026",
            unit: "",
            component: "",
            useOtherShortcut: false,
            subComponent: "",
            keyActivity: "",
            no: "",
            performanceIndicator: "",
            subActivity: "",
            titleOfActivities: "",
        },
    })

    const planningYears = ["2026", "2027", "2028"]

    const unit = watch("unit")
    const component = watch("component")
    const useOtherShortcut = watch("useOtherShortcut")
    const subComponent = watch("subComponent")
    const keyActivity = watch("keyActivity")
    const selectedNo = watch("no")
    const watchedSubActivity = watch("subActivity")

    const unitOptions = useMemo(() => {
        return awpbTree.unitOptions.map((item) => item.value)
    }, [])

    const componentOptions = useMemo(() => {
        return Object.keys(awpbTree.hierarchy || {})
    }, [])

    const currentComponentNode = useMemo(() => {
        return awpbTree.hierarchy?.[component] || null
    }, [component])

    const otherShortcutPath = useMemo(() => {
        return findOtherOperatingPath(currentComponentNode)
    }, [currentComponentNode])

    const rawSubComponentKeys = useMemo(() => {
        if (!component) return []
        return Object.keys(currentComponentNode || {})
    }, [component, currentComponentNode])

    const hasNoSubComponent =
        rawSubComponentKeys.length === 1 && rawSubComponentKeys[0] === ""

    const visibleSubComponentOptions = useMemo(() => {
        return rawSubComponentKeys.filter((key) => key !== "")
    }, [rawSubComponentKeys])

    const subComponentKey =
        subComponent === FALLBACK_VALUE ? "" : subComponent

    const keyActivityOptions = useMemo(() => {
        if (!component) return []
        return Object.keys(
            awpbTree.hierarchy?.[component]?.[subComponentKey] || {}
        )
    }, [component, subComponentKey])

    const noOptions = useMemo(() => {
        if (!component || !keyActivity) return []
        return (
            awpbTree.hierarchy?.[component]?.[subComponentKey]?.[keyActivity] || []
        )
    }, [component, subComponentKey, keyActivity])

    const selectedNoEntry = useMemo(() => {
        return noOptions.find((item) => String(item.no) === String(selectedNo))
    }, [noOptions, selectedNo])

    const subActivityOptions = useMemo(() => {
        return selectedNoEntry?.subActivities || []
    }, [selectedNoEntry])

    const hasNoSubActivity =
        Boolean(selectedNo) && subActivityOptions.length === 0

    useEffect(() => {
        resetField("component")
        resetField("useOtherShortcut")
        resetField("subComponent")
        resetField("keyActivity")
        resetField("no")
        resetField("performanceIndicator")
        resetField("subActivity")
    }, [unit, resetField])

    useEffect(() => {
        resetField("useOtherShortcut")
        resetField("subComponent")
        resetField("keyActivity")
        resetField("no")
        resetField("performanceIndicator")
        resetField("subActivity")

        if (component && hasNoSubComponent) {
            setValue("subComponent", FALLBACK_VALUE, {
                shouldValidate: true,
                shouldDirty: false,
            })
        }
    }, [component, hasNoSubComponent, resetField, setValue])

    useEffect(() => {
        if (!component || !otherShortcutPath) return

        if (useOtherShortcut) {
            const targetSubComponent =
                otherShortcutPath.subComponentKey === ""
                    ? FALLBACK_VALUE
                    : otherShortcutPath.subComponentKey

            setValue("subComponent", targetSubComponent, {
                shouldValidate: true,
                shouldDirty: true,
            })

            setValue("keyActivity", otherShortcutPath.keyActivityKey, {
                shouldValidate: true,
                shouldDirty: true,
            })

            resetField("no")
            resetField("performanceIndicator")
            resetField("subActivity")
            return
        }

        resetField("subComponent")
        resetField("keyActivity")
        resetField("no")
        resetField("performanceIndicator")
        resetField("subActivity")

        if (hasNoSubComponent) {
            setValue("subComponent", FALLBACK_VALUE, {
                shouldValidate: true,
                shouldDirty: false,
            })
        }
    }, [
        useOtherShortcut,
        component,
        otherShortcutPath,
        hasNoSubComponent,
        resetField,
        setValue,
    ])

    useEffect(() => {
        if (useOtherShortcut) return

        resetField("keyActivity")
        resetField("no")
        resetField("performanceIndicator")
        resetField("subActivity")
    }, [subComponent, useOtherShortcut, resetField])

    useEffect(() => {
        resetField("no")
        resetField("performanceIndicator")
        resetField("subActivity")
    }, [keyActivity, resetField])

    useEffect(() => {
        setValue(
            "performanceIndicator",
            selectedNoEntry?.performanceIndicator || "",
            {
                shouldValidate: true,
                shouldDirty: false,
            }
        )

        if (!selectedNo) {
            resetField("subActivity")
            return
        }

        if (hasNoSubActivity) {
            setValue("subActivity", FALLBACK_VALUE, {
                shouldValidate: true,
                shouldDirty: false,
            })
        } else if (watchedSubActivity === FALLBACK_VALUE) {
            setValue("subActivity", "", {
                shouldValidate: true,
                shouldDirty: false,
            })
        }
    }, [
        selectedNo,
        selectedNoEntry,
        hasNoSubActivity,
        watchedSubActivity,
        setValue,
        resetField,
    ])

    const onSubmit = (data) => {
        console.log("Classification form data:", data)
        alert("Classification section is working.")
    }

    const shortcutSubComponentLabel =
        otherShortcutPath?.subComponentKey === ""
            ? FALLBACK_VALUE
            : otherShortcutPath?.subComponentKey || ""

    return (
        <div className="max-w-5xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Submit Entry</h1>
                <p className="text-sm text-gray-500">
                    Fill out the AWPB classification fields first.
                </p>
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-sm">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Planning Year
                            </label>
                            <select
                                {...register("planningYear", {
                                    required: "Planning Year is required",
                                })}
                                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
                            >
                                {planningYears.map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                            {errors.planningYear && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.planningYear.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium">Unit</label>
                            <select
                                {...register("unit", {
                                    required: "Unit is required",
                                })}
                                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
                            >
                                <option value="">Select unit</option>
                                {unitOptions.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                            {errors.unit && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.unit.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Component
                            </label>
                            <select
                                {...register("component", {
                                    required: "Component is required",
                                })}
                                disabled={!unit}
                                className="w-full rounded-lg border px-3 py-2 text-sm outline-none disabled:bg-gray-100 disabled:text-gray-400 focus:ring-2 focus:ring-gray-300"
                            >
                                <option value="">Select component</option>
                                {componentOptions.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                            {errors.component && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.component.message}
                                </p>
                            )}
                        </div>

                        {component && otherShortcutPath ? (
                            <div className="rounded-lg border bg-amber-50 p-4">
                                <label className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        {...register("useOtherShortcut")}
                                        className="mt-1"
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-amber-900">
                                            Continue to "Other Operating Cost" 
                                        </p>
                                        <p className="text-xs text-amber-800">
                                            Shortcut to {otherShortcutPath.keyActivityKey}
                                        </p>
                                    </div>
                                </label>
                            </div>
                        ) : (
                            <div />
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Sub component
                            </label>

                            {component && hasNoSubComponent ? (
                                <>
                                    <input
                                        type="hidden"
                                        {...register("subComponent", {
                                            required: "Sub component is required",
                                        })}
                                    />
                                    <input
                                        type="text"
                                        readOnly
                                        value={FALLBACK_VALUE}
                                        className="w-full rounded-lg border bg-gray-50 px-3 py-2 text-sm text-gray-600 outline-none"
                                    />
                                </>
                            ) : useOtherShortcut && otherShortcutPath ? (
                                <>
                                    <input
                                        type="hidden"
                                        {...register("subComponent", {
                                            required: "Sub component is required",
                                        })}
                                    />
                                    <input
                                        type="text"
                                        readOnly
                                        value={shortcutSubComponentLabel}
                                        className="w-full rounded-lg border bg-amber-50 px-3 py-2 text-sm text-amber-900 outline-none"
                                    />
                                </>
                            ) : (
                                <select
                                    {...register("subComponent", {
                                        required: "Sub component is required",
                                    })}
                                    disabled={!component}
                                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none disabled:bg-gray-100 disabled:text-gray-400 focus:ring-2 focus:ring-gray-300"
                                >
                                    <option value="">Select sub component</option>
                                    {visibleSubComponentOptions.map((item) => (
                                        <option key={item} value={item}>
                                            {item}
                                        </option>
                                    ))}
                                </select>
                            )}

                            {errors.subComponent && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.subComponent.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Key Activity
                            </label>

                            {useOtherShortcut && otherShortcutPath ? (
                                <>
                                    <input
                                        type="hidden"
                                        {...register("keyActivity", {
                                            required: "Key Activity is required",
                                        })}
                                    />
                                    <input
                                        type="text"
                                        readOnly
                                        value={otherShortcutPath.keyActivityKey}
                                        className="w-full rounded-lg border bg-amber-50 px-3 py-2 text-sm text-amber-900 outline-none"
                                    />
                                </>
                            ) : (
                                <select
                                    {...register("keyActivity", {
                                        required: "Key Activity is required",
                                    })}
                                    disabled={!component || (!hasNoSubComponent && !subComponent)}
                                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none disabled:bg-gray-100 disabled:text-gray-400 focus:ring-2 focus:ring-gray-300"
                                >
                                    <option value="">Select key activity</option>
                                    {keyActivityOptions.map((item) => (
                                        <option key={item} value={item}>
                                            {item}
                                        </option>
                                    ))}
                                </select>
                            )}

                            {errors.keyActivity && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.keyActivity.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium">No.</label>
                            <select
                                {...register("no", {
                                    required: "No. is required",
                                })}
                                disabled={!keyActivity}
                                className="w-full rounded-lg border px-3 py-2 text-sm outline-none disabled:bg-gray-100 disabled:text-gray-400 focus:ring-2 focus:ring-gray-300"
                            >
                                <option value="">Select no.</option>
                                {noOptions.map((item) => (
                                    <option key={item.no} value={String(item.no)}>
                                        {item.no} - {item.performanceIndicator}
                                    </option>
                                ))}
                            </select>
                            {errors.no && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.no.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Performance Indicator
                            </label>
                            <input
                                type="text"
                                readOnly
                                {...register("performanceIndicator", {
                                    required: "Performance Indicator is required",
                                })}
                                className="w-full rounded-lg border bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none"
                            />
                            {errors.performanceIndicator && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.performanceIndicator.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Sub Activity
                            </label>

                            {hasNoSubActivity ? (
                                <>
                                    <input
                                        type="hidden"
                                        {...register("subActivity", {
                                            required: "Sub Activity is required",
                                        })}
                                    />
                                    <input
                                        type="text"
                                        readOnly
                                        value={FALLBACK_VALUE}
                                        className="w-full rounded-lg border bg-gray-50 px-3 py-2 text-sm text-gray-600 outline-none"
                                    />
                                </>
                            ) : (
                                <select
                                    {...register("subActivity", {
                                        required: "Sub Activity is required",
                                    })}
                                    disabled={!selectedNo}
                                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none disabled:bg-gray-100 disabled:text-gray-400 focus:ring-2 focus:ring-gray-300"
                                >
                                    <option value="">Select sub activity</option>
                                    {subActivityOptions.map((item) => (
                                        <option key={item} value={item}>
                                            {item}
                                        </option>
                                    ))}
                                </select>
                            )}

                            {errors.subActivity && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.subActivity.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Title of Activities
                            </label>
                            <input
                                type="text"
                                placeholder="Enter title of activities"
                                {...register("titleOfActivities", {
                                    required: "Title of Activities is required",
                                })}
                                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
                            />
                            {errors.titleOfActivities && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.titleOfActivities.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                        >
                            Save Classification
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}