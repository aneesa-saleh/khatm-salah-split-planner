import { useState } from 'react';
import { useForm } from "react-hook-form";
import { Slider, Checkbox, TextField, Button } from '@radix-ui/themes';

import { FIRST_JUZ_NUMBER, LAST_JUZ_NUMBER } from "../data/quranData";
import type { ScheduleForm } from './typing/scheduleForm';
import errorIcon from "@/assets/icons/error.png";
import { generateRevisionSchedule } from './utils';

const defaultFormValues: ScheduleForm = {
  rangeStart: FIRST_JUZ_NUMBER,
  rangeEnd: LAST_JUZ_NUMBER,
  tahajjudChecked: false,
  fajrChecked: true,
  zuhrChecked: true,
  asrChecked: true,
  maghribChecked: true,
  ishaChecked: true,
  daysToComplete: '29'
}

const Home = () => {
  const form = useForm<ScheduleForm>({
    defaultValues: defaultFormValues
  });

  const [salahSelectionError, setSalahSelectionError] = useState('');
  const [daysToCompleteError, setDaysToCompleteError] = useState('');

  const handleJuzRangeChange = (range: number[]) => {
    form.setValue('rangeStart', range[0])
    form.setValue('rangeEnd', range[1])
  }

  const validateSalahSelection = () => {
    if (!form.watch('tahajjudChecked') &&
      !form.watch('fajrChecked') &&
      !form.watch('zuhrChecked') &&
      !form.watch('asrChecked') &&
      !form.watch('maghribChecked') &&
      !form.watch('ishaChecked')
    ) {
      setSalahSelectionError('Select at least one salah')
      return false
    }

    return true;
  }

  const validateDaysToComplete = () => {
    const daysToComplete = Number(form.watch('daysToComplete'))
    if (daysToComplete < 1
    ) {
      setDaysToCompleteError('Enter a number of days greater than 0')
      return false
    }

    if (daysToComplete > 365
    ) {
      setDaysToCompleteError('Enter a number of days within 1 year (365 days or less)')
      return false
    }

    return true;
  }

  const processFormData = (data: ScheduleForm) => {
    // Clear any existing errors in case they've been fixed now
    setDaysToCompleteError('');
    setSalahSelectionError('');

    const isSalahSelectionValid = validateSalahSelection();
    const isDaysToCompleteValid = validateDaysToComplete();

    if (!isDaysToCompleteValid || !isSalahSelectionValid) return;

    console.log(generateRevisionSchedule(data));
  }

  return (
    <>
      <main className="flex flex-col gap-2 h-screen w-screen items-center justify-center m-5">
        <h1>Khatm by Salah Planner</h1>
        <div>
          <p>Create Qur'an Khatm Schedule planned for each day</p>
        </div>

        <section className="flex items-center justify-center w-full mt-5">
          <form onSubmit={form.handleSubmit(processFormData)} className="flex flex-col gap-7 w-100 items-center justify-center">
            <div className='w-full flex flex-col gap-1'>
              <p className="text-sm">Select Juz Range:</p>
              <div className="w-full flex gap-2 items-center whitespace-nowrap">
                <p>Juz {form?.watch('rangeStart')}</p>
                <Slider
                  onValueChange={handleJuzRangeChange}
                  defaultValue={[form?.watch('rangeStart'), form?.watch('rangeEnd')]}
                  step={1}
                  min={FIRST_JUZ_NUMBER}
                  max={LAST_JUZ_NUMBER}
                  radius="small"
                />
                <p>Juz {form?.watch('rangeEnd')}</p>
              </div>
            </div>


            <div className="w-full flex flex-col gap-2 relative">
              <p className="text-sm">Choose Salah for completion:</p>

              <div className="grid grid-cols-3 gap-3 text-center">
                <label className="flex items-center gap-1.5">
                  <Checkbox
                    checked={form.watch('tahajjudChecked')}
                    onCheckedChange={(checked => form.setValue('tahajjudChecked', checked as boolean))}
                  />
                  Tahajjud
                </label>

                <label className="flex items-center gap-1.5">
                  <Checkbox
                    checked={form.watch('fajrChecked')}
                    onCheckedChange={(checked => form.setValue('fajrChecked', checked as boolean))}
                  />
                  Fajr
                </label>

                <label className="flex items-center gap-1.5">
                  <Checkbox
                    checked={form.watch('zuhrChecked')}
                    onCheckedChange={(checked => form.setValue('zuhrChecked', checked as boolean))}
                  />
                  Zuhr
                </label>

                <label className="flex items-center gap-1.5">
                  <Checkbox
                    checked={form.watch('asrChecked')}
                    onCheckedChange={(checked => form.setValue('asrChecked', checked as boolean))}
                  />
                  Asr
                </label>

                <label className="flex items-center gap-1.5">
                  <Checkbox
                    checked={form.watch('maghribChecked')}
                    onCheckedChange={(checked => form.setValue('maghribChecked', checked as boolean))}
                  />
                  Maghrib
                </label>

                <label className="flex items-center gap-1.5">
                  <Checkbox
                    checked={form.watch('ishaChecked')}
                    onCheckedChange={(checked => form.setValue('ishaChecked', checked as boolean))}
                  />
                  Isha
                </label>
              </div>

              {
                Boolean(salahSelectionError) &&
                <p className="absolute -bottom-5 text-sm text-red-500 flex items-center">
                  <img src={errorIcon} width={16} height={16} alt="" /> {salahSelectionError}
                </p>
              }
            </div>

            <label className="w-full relative">
              <p className="text-sm mb-1">Number of days for completion (1 to 365 days):</p>
              <TextField.Root
                placeholder="Enter a number"
                value={form.watch('daysToComplete')}
                onChange={((event: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) => form.setValue('daysToComplete', event?.target?.value as string))}
                type="number"
                min={1}
                max={365}
              />

              {
                Boolean(daysToCompleteError) &&
                <p className="absolute -bottom-5 text-sm text-red-500 flex items-center">
                  <img src={errorIcon} width={16} height={16} alt="" /> {daysToCompleteError}
                </p>
              }
            </label>

            <Button type="submit" className="flex w-full cursor-pointer!">Generate Completion Schedule</Button>
          </form>
        </section>

        <footer className="fixed bottom-0 p-2 text-xs bg-[rgba(255,255,255,0.5)]">
          Icons by <a target="_blank" href="https://icons8.com">Icons8</a>
        </footer>
      </main>
    </>
  )
}

export default Home
