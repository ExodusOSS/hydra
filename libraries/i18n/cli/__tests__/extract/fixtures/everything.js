import React from 'react'
import lodash from 'lodash'
import { T, t, useI18n } from '@exodus/i18n'

const { sample } = lodash

const SLIDES = [
  { id: 'book-1', title: t("Philosopher's Stone") },
  { id: 'book-2', title: t('Chamber of Secrets') },
]

const HOGWARTS_HOUSES = ['Gryffindor', 'Hufflepuff', 'Ravenclaw', 'Slytherin']

const SomeComponent = () => {
  const { t } = useI18n()

  const yourHouse = t(`You were sorted in ${sample(HOGWARTS_HOUSES)}`)

  return (
    <>
      <h1>
        <T>Harry Potter books...</T>
      </h1>

      <p>{yourHouse}</p>

      {SLIDES.map((slide) => (
        <p key={slide.id}>{slide.title}</p>
      ))}
    </>
  )
}

export default SomeComponent
