import { useState } from 'react';
import { useForm } from "react-hook-form";
import { Slider, Checkbox, TextField, Button, RadioCards } from '@radix-ui/themes';
import writeXlsxFile from 'write-excel-file'

import { FIRST_JUZ_NUMBER, LAST_JUZ_NUMBER, MAX_COMPLETION_DAYS } from "../data/quranData";
import type { ScheduleForm } from './typing/scheduleForm';
import errorIcon from "@/assets/icons/error.png";
import quranImage from "@/assets/images/quran.svg";
import githubIcon from "@/assets/icons/github.svg";
import { buildExcelTable, columnConfig, generateFixedTimeRevisionSchedule, getScheduleFileName } from './utils';
import { PageGroup, type PageGroupType } from './typing';
import { PageGroupDisplayName, PageGroupLimit } from './constants';

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

  const [pageGroupType, setPageGroupType] = useState<PageGroupType>(PageGroup.Juz);

  const pageGroupLabel = PageGroupDisplayName[pageGroupType] || ''

  const [salahSelectionError, setSalahSelectionError] = useState('');
  const [daysToCompleteError, setDaysToCompleteError] = useState('');

  const handleRangeChange = (range: number[]) => {
    form.setValue('rangeStart', range[0])
    form.setValue('rangeEnd', range[1])
  }

  console.log(`[form?.watch('rangeStart'), form?.watch('rangeEnd')]`);
  console.log([form?.watch('rangeStart'), form?.watch('rangeEnd')]);
  

  const handlePageGroupChange = (newValue: PageGroupType) => {
    setPageGroupType(newValue as PageGroupType)

    const newRangeMax = PageGroupLimit[newValue].max || 1;
    const newRangeMin = PageGroupLimit[newValue].min || 1;

    form.setValue('rangeStart', newRangeMin)
    form.setValue('rangeEnd', newRangeMax)
  }

  const rangeMax = PageGroupLimit[pageGroupType].max || 1;
  const rangeMin = PageGroupLimit[pageGroupType].min || 1;

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

    if (daysToComplete > MAX_COMPLETION_DAYS
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

    try {
      const schedule = generateFixedTimeRevisionSchedule(data, pageGroupType)
      const spreadsheetData = buildExcelTable(schedule)

      // user may enter a number too large to fill all the days
      // the spreadsheet will have the blank rows trimmed, so subtract the header row to get the data row count
      const dataRowCount = spreadsheetData?.length - 1;


      writeXlsxFile(spreadsheetData as any, {
        columns: columnConfig,
        fileName: getScheduleFileName({
          rangeStart: data?.rangeStart,
          rangeEnd: data?.rangeEnd,
          dayCount: Math.min(Number(data?.daysToComplete), dataRowCount),
          pageGroupType
        }),
        stickyRowsCount: 1,
        stickyColumnsCount: 1
      })
    } catch (e) {
      alert('An error occurred! Please try again.')
      console.log(e);
    }

  }

  return (
    <>
      <main className="flex flex-col gap-2.5 h-screen w-screen items-center justify-start p-5 pt-20 lg:justify-center lg:pt-5">
        <div className="flex gap-1.5 items-center">
          <img src={quranImage} width={50} height={50} alt="" /> {salahSelectionError}
          <h1 className="whitespace-nowrap text-2xl! sm:text-4xl! tracking-wider text-center font-extrabold">Khatm by Salah Planner</h1>
        </div>
        <div>
          <p>Create a Qur'an Khatm (Completion) Schedule anchored to your daily prayers</p>
        </div>

        <section className="flex flex-col gap-3 items-center justify-center w-full mt-7">
          <h2 className="font-bold">Customise your plan:</h2>
          <RadioCards.Root
            className="h-8 flex! justify-center items-center"
            color="amber"
            value={pageGroupType}
            columns={{ initial: "1", sm: "3" }}
            onValueChange={handlePageGroupChange}
          >
            <RadioCards.Item value={PageGroup.Juz} className="cursor-pointer!">
              <div className="flex flex-col">
                <p>Juz Range</p>
              </div>
            </RadioCards.Item>
            <RadioCards.Item value={PageGroup.Page} className="cursor-pointer!">
              <div className="flex flex-col">
                <p>Page Range</p>
              </div>
            </RadioCards.Item>
          </RadioCards.Root>
          <form onSubmit={form.handleSubmit(processFormData)} className="flex flex-col gap-7 max-w-125 w-full sm:w-125 items-center justify-center">
            <div className='w-full flex flex-col gap-1'>
              <p className="text-sm">Select Range:</p>
              <div className="w-full flex gap-2 items-center whitespace-nowrap">
                <p>{pageGroupLabel} {form?.watch('rangeStart')}</p>
                <Slider
                  className="[&_.rt-SliderRange]:bg-[#CF9F30]!"
                  onValueChange={handleRangeChange}
                  value={[form?.watch('rangeStart'), form?.watch('rangeEnd')]}
                  step={1}
                  min={rangeMin}
                  max={rangeMax}
                  radius="small"
                  color="gold"
                />
                <p>{pageGroupLabel} {form?.watch('rangeEnd')}</p>
              </div>
            </div>


            <div className="w-full flex flex-col gap-2 relative">
              <p className="text-sm">Choose Salah for completion:</p>

              <div className="grid grid-cols-3 gap-3 text-center">
                <label className="flex items-center gap-1.5">
                  <Checkbox
                    color="amber"
                    checked={form.watch('tahajjudChecked')}
                    onCheckedChange={(checked => form.setValue('tahajjudChecked', checked as boolean))}
                  />
                  Tahajjud
                </label>

                <label className="flex items-center gap-1.5">
                  <Checkbox
                    color="amber"
                    checked={form.watch('fajrChecked')}
                    onCheckedChange={(checked => form.setValue('fajrChecked', checked as boolean))}
                  />
                  Fajr
                </label>

                <label className="flex items-center gap-1.5">
                  <Checkbox
                    color="amber"
                    checked={form.watch('zuhrChecked')}
                    onCheckedChange={(checked => form.setValue('zuhrChecked', checked as boolean))}
                  />
                  Zuhr
                </label>

                <label className="flex items-center gap-1.5">
                  <Checkbox
                    color="amber"
                    checked={form.watch('asrChecked')}
                    onCheckedChange={(checked => form.setValue('asrChecked', checked as boolean))}
                  />
                  Asr
                </label>

                <label className="flex items-center gap-1.5">
                  <Checkbox
                    color="amber"
                    checked={form.watch('maghribChecked')}
                    onCheckedChange={(checked => form.setValue('maghribChecked', checked as boolean))}
                  />
                  Maghrib
                </label>

                <label className="flex items-center gap-1.5">
                  <Checkbox
                    color="amber"
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
                  <img src={errorIcon} width={20} height={20} alt="" /> {daysToCompleteError}
                </p>
              }
            </label>

            <Button color="gold" type="submit" className="flex w-full cursor-pointer! bg-[#CF9F30]!">
              Generate Completion Schedule
            </Button>
          </form>
        </section>

        <footer className="flex gap-3 fixed bottom-0 p-2 text-xs bg-[rgba(255,255,255,0.5)] items-center">
          <span>
            <a target="_blank" href="https://github.com/aneesa-saleh/khatm-salah-split-planner/issues" className="flex gap-1 items-center">
              <img src={githubIcon} width={20} height={20} alt="Link to Github" /> <span className="tracking-wider">Feedback/Contribution</span>
            </a>
          </span>
          <span> | </span>
          <span>Icons by <a target="_blank" href="https://icons8.com">Icons8</a></span>
        </footer>
      </main>
    </>
  )
}

export default Home
