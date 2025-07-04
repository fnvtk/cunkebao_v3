"use client"

import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Calendar } from "./calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"

interface DateRangePickerProps {
  className?: string
  value?: DateRange
  onChange?: (date: DateRange | undefined) => void
}

export function DateRangePicker({ className, value, onChange }: DateRangePickerProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn("w-[300px] justify-start text-left font-normal", !value && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, "yyyy年MM月dd日", { locale: zhCN })} -{" "}
                  {format(value.to, "yyyy年MM月dd日", { locale: zhCN })}
                </>
              ) : (
                format(value.from, "yyyy年MM月dd日", { locale: zhCN })
              )
            ) : (
              <span>选择日期范围</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
            locale={zhCN}
            showOutsideDays={false}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

