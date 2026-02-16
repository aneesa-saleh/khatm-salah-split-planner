import { useEffect } from 'react';
import { useForm } from "react-hook-form";
import { Slider, Checkbox, TextField, Button } from '@radix-ui/themes';
import cn from 'classnames';

import QURAN_DATA, { FIRST_JUZ_NUMBER, LAST_JUZ_NUMBER } from "../data/quranData";
import type { ScheduleForm } from './typing/scheduleForm';

const defaultFormValues: ScheduleForm = {
  startRange: FIRST_JUZ_NUMBER,
  endRange: LAST_JUZ_NUMBER,
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

  const handleJuzRangeChange = (range: number[]) => {
    form.setValue('startRange', range[0])
    form.setValue('endRange', range[1])
  }

  useEffect(() => {
    console.log('QURAN_DATA');
    console.log(QURAN_DATA);
  }, [])

  const processFormData = (data: ScheduleForm) => { console.log(data); }

  return (
    <>
      <main className="flex flex-col gap-2 h-screen w-screen items-center justify-center">
        <h1>Khatm by Salah Planner</h1>
        <div className="mt-2">
          <p>Create Qur'an Khatm Schedule planned for each day</p>
        </div>

        <section className="flex items-center justify-center w-full mt-5">
          <form onSubmit={form.handleSubmit(processFormData)} className="flex flex-col gap-6 w-100 items-center justify-center">
            <div className='w-full flex flex-col gap-1'>
              <p className="text-sm">Select Juz Range:</p>
              <div className="w-full flex gap-2 items-center whitespace-nowrap">
                <p>Juz {form?.watch('startRange')}</p>
                <Slider
                  onValueChange={handleJuzRangeChange}
                  defaultValue={[form?.watch('startRange'), form?.watch('endRange')]}
                  step={1}
                  min={FIRST_JUZ_NUMBER}
                  max={LAST_JUZ_NUMBER}
                  radius="small"
                />
                <p>Juz {form?.watch('endRange')}</p>
              </div>
            </div>


            <div className="w-full flex flex-col gap-2">
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
            </div>

            <label className="w-full">
              <p className="text-sm">Number of days for completion (1 to 365 days):</p>
              <TextField.Root
                placeholder="Enter a number"
                value={form.watch('daysToComplete')}
                onChange={((event: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) => form.setValue('daysToComplete', event?.target?.value as string))}
                type="number"
                min={1}
                max={365}
              />
            </label>

            <Button type="submit" className="flex w-full cursor-pointer!">Generate Completion Schedule</Button>
          </form>
        </section>
      </main>
    </>
  )
}

export default Home
