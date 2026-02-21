import { useEffect, useState, type ChangeEventHandler } from 'react';
import { useForm } from "react-hook-form";
import { Slider, Checkbox, TextField, Button, RadioCards } from '@radix-ui/themes';
import writeXlsxFile from 'write-excel-file'

import QURAN_DATA, { FIRST_JUZ_NUMBER, LAST_JUZ_NUMBER, MAX_COMPLETION_DAYS } from "../data/quranData";
import type { ScheduleForm } from './typing/scheduleForm';
import errorIcon from "@/assets/icons/error.png";
import quranImage from "@/assets/images/quran.svg";
import githubIcon from "@/assets/icons/github.svg";
import { buildExcelTable, columnConfig, generateFixedTimeRevisionSchedule, getScheduleFileName, getSurahName } from './utils';
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

  const rangeMax = PageGroupLimit[pageGroupType].max || 1;
  const rangeMin = PageGroupLimit[pageGroupType].min || 1;

  const rangeStartFormValue = form.watch('rangeStart')
  const rangeEndFormValue = form.watch('rangeEnd')

  const [rangeStartInputValue, setRangeStartInputValue] = useState<number | string>(form?.watch('rangeStart'));
  const [rangeEndInputValue, setRangeEndInputValue] = useState<number | string>(form?.watch('rangeEnd'));

  const rangeStartInputAsNumber = Number(rangeStartInputValue);
  const rangeEndInputAsNumber = Number(rangeEndInputValue);

  const isRangeStartInputValid = Number.isFinite(rangeStartInputAsNumber)
    &&  rangeStartInputAsNumber <= rangeMax
    && rangeStartInputAsNumber >= rangeMin

  const isRangeEndInputValid = Number.isFinite(rangeEndInputAsNumber)
    &&  rangeEndInputAsNumber <= rangeMax
    && rangeEndInputAsNumber >= rangeMin

  // generate range input error
  // not setting to state because it'll be set and cleared on the fly. maybe refactor later

  let rangeInputError = ''

  if (!isRangeStartInputValid) rangeInputError = `Invalid Start ${pageGroupLabel} (Enter a number from ${rangeMin} to ${rangeMax})`;
  else if (!isRangeEndInputValid) rangeInputError = `Invalid end ${pageGroupLabel}`;
  else if (rangeStartInputAsNumber > rangeEndFormValue) `Start ${pageGroupLabel} needs to be less than or same as end ${pageGroupLabel}`;
  else if (rangeEndInputAsNumber < rangeStartFormValue) `End ${pageGroupLabel} needs to be greater than or same as start ${pageGroupLabel}`;

  const [salahSelectionError, setSalahSelectionError] = useState('');
  const [daysToCompleteError, setDaysToCompleteError] = useState('');

  /* TODO: Refactor this to a util(s) */
  // Group means a group of pages which are pages, juzs, etc.
  let firstPageNumberInRangeStartGroup = form.watch('rangeStart'); /* assume page as simplest case */

  if (pageGroupType === PageGroup.Juz) {
    firstPageNumberInRangeStartGroup = QURAN_DATA?.juzs?.references[form.watch('rangeStart') - 1]?.start?.page
  }

  const firstPageInRangeStartGroup = QURAN_DATA?.pages?.references[firstPageNumberInRangeStartGroup - 1]?.start
  const firstSurahInRangeStartGroup = firstPageInRangeStartGroup?.surah;
  const firstVerseInRangeStartGroup = firstPageInRangeStartGroup?.ayah;

  // ----- //

  let fistPageNumberInRangeEndGroup = form.watch('rangeEnd'); /* assume page as simplest case */

  if (pageGroupType === PageGroup.Juz) {
    fistPageNumberInRangeEndGroup = QURAN_DATA?.juzs?.references[form.watch('rangeEnd') - 1]?.start?.page
  }

  const firstPageInRangeEndGroup = QURAN_DATA?.pages?.references[fistPageNumberInRangeEndGroup - 1]?.start
  const firstSurahInRangeEndGroup = firstPageInRangeEndGroup?.surah;
  const firstVerseInRangeEndGroup = firstPageInRangeEndGroup?.ayah;

  /* -- end of util(s) -- */

  const rangeStartSurahName = getSurahName(firstSurahInRangeStartGroup);
  const rangeEndSurahName = getSurahName(firstSurahInRangeEndGroup);

  const rangeStartVerseReference = `${firstSurahInRangeStartGroup}:${firstVerseInRangeStartGroup}`;
  const rangeEndVerseReference = `${firstSurahInRangeEndGroup}:${firstVerseInRangeEndGroup}`;

  const handlePageGroupChange = (newValue: PageGroupType) => {
    setPageGroupType(newValue as PageGroupType)

    const newRangeMax = PageGroupLimit[newValue].max || 1;
    const newRangeMin = PageGroupLimit[newValue].min || 1;

    form.setValue('rangeStart', newRangeMin)
    form.setValue('rangeEnd', newRangeMax)
  }

  const handleRangeChange = (range: number[]) => {
    form.setValue('rangeStart', range[0])
    form.setValue('rangeEnd', range[1])
  }

  const handleRangeStartInputChange: ChangeEventHandler<HTMLInputElement, HTMLInputElement> = (e) => {
    const value = e?.target?.value;
    setRangeStartInputValue(value);

    const valueAsNumber = Number(value);
    
    if (Number.isFinite(valueAsNumber)) {
      form.setValue('rangeStart', valueAsNumber);
    } else {
      form.setValue('rangeStart', 0);
    }
  }

  const handleRangeEndInputChange: ChangeEventHandler<HTMLInputElement, HTMLInputElement> = (e) => {
    const value = e?.target?.value;
    setRangeEndInputValue(value);

    const valueAsNumber = Number(value);
    
    if (Number.isFinite(valueAsNumber)) {
      form.setValue('rangeEnd', valueAsNumber);
    } else {
      form.setValue('rangeStart', 0);
    }
  }

  const validateJuzRange = () => {
    return Boolean(rangeStartFormValue) && Boolean(rangeEndFormValue)
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

    const isJuzRangeValid = validateJuzRange();
    const isSalahSelectionValid = validateSalahSelection();
    const isDaysToCompleteValid = validateDaysToComplete();

    if (!isDaysToCompleteValid || !isSalahSelectionValid || !isJuzRangeValid) return;

    /* if the user enters a min > max or max > min, just flip the range to be valid */
    const rangeStart = Math.min(data?.rangeStart, data?.rangeEnd);
    const rangeEnd = Math.max(data?.rangeStart, data?.rangeEnd)

    try {
      const schedule = generateFixedTimeRevisionSchedule({
          ...data, rangeStart, rangeEnd
        },
        pageGroupType
      )
      const spreadsheetData = buildExcelTable(schedule)

      // user may enter a number too large to fill all the days
      // the spreadsheet will have the blank rows trimmed, so subtract the header row to get the data row count
      const dataRowCount = spreadsheetData?.length - 1;


      writeXlsxFile(spreadsheetData as any, {
        columns: columnConfig,
        fileName: getScheduleFileName({
          rangeStart,
          rangeEnd,
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

  useEffect(() => {
    if (Number(rangeStartInputValue) !== Number(rangeStartFormValue)) {
      setRangeStartInputValue(rangeStartFormValue);
    }
  }, [rangeStartFormValue])

  useEffect(() => {
    if (Number(rangeEndInputValue) !== Number(rangeEndFormValue)) {
      setRangeEndInputValue(rangeEndFormValue);
    }
  }, [rangeEndFormValue])

  return (
    <>
      <main className="flex flex-col gap-2.5 h-screen w-screen items-center justify-start p-5 pt-15 lg:justify-center lg:pt-5">
        <div className="flex gap-1.5 items-center">
          <img src={quranImage} width={50} height={50} alt="" /> {salahSelectionError}
          <h1 className="whitespace-nowrap text-2xl! sm:text-4xl! tracking-wider text-center font-extrabold">Khatm by Salah Planner</h1>
        </div>
        <div>
          <p>Create a Qur'an Khatm (Completion) Schedule anchored to your daily prayers</p>
        </div>

        <section className="flex flex-col gap-3 items-center justify-center w-full mt-3 lg:mt-7">
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
              <div className="flex flex-col relative">
                <div className="w-full flex gap-2 items-center whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <span className="text-sm">{pageGroupLabel}</span>
                    <TextField.Root
                      type="number"
                      value={rangeStartInputValue}
                      min={rangeMin}
                      max={rangeMax}
                      onChange={handleRangeStartInputChange}
                      className="w-11"
                    />
                  </div>

                  <Slider
                    className="[&_.rt-SliderRange]:bg-[#CF9F30]!"
                    onValueChange={handleRangeChange}
                    value={[form?.watch('rangeStart') || 0, form?.watch('rangeEnd') || 0]}
                    step={1}
                    min={rangeMin}
                    max={rangeMax}
                    radius="small"
                    color="gold"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-sm">{pageGroupLabel}</span>
                    <TextField.Root
                      type="number"
                      value={rangeEndInputValue}
                      min={rangeMin}
                      max={rangeMax}
                      onChange={handleRangeEndInputChange}
                      className="w-11 text-center"
                    />
                  </div>
                </div>
                <div className="flex w-full justify-between min-h-8">
                  {isRangeStartInputValid ? <div className="flex flex-col justify-start items-start whitespace-nowrap">
                    <p className="text-xs">{rangeStartSurahName}</p>
                    <p className="text-xs">({rangeStartVerseReference})</p>
                  </div> : <div />}
                  {isRangeEndInputValid ? <div className="flex flex-col justify-end items-end whitespace-nowrap">
                    <p className="text-xs">{rangeEndSurahName}</p>
                    <p className="text-xs">({rangeEndVerseReference})</p>
                  </div> : <div />}
                </div>

                {
                  Boolean(rangeInputError) &&
                  <p className="absolute -bottom-5 text-sm text-red-500 flex items-center">
                    <img src={errorIcon} width={20} height={20} alt="error" /> {rangeInputError}
                  </p>
                }
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
                  <img src={errorIcon} width={20} height={20} alt="error" /> {salahSelectionError}
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

        <footer className="flex gap-3 fixed bottom-0 p-2 text-xs bg-[rgba(255,255,255,0.8)] items-center">
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
