import { useState } from 'react'
import './App.css'
import { Button, Input, Text } from '@rewind-ui/core';

function App() {
  return (
    <>
      <Text variant="d3">MTG Window Shopper</Text>
      <div>
        Use this application to search for cards from multiple storefronts at once.
      </div>
      <Input size="md" color="blue" placeholder="Search for cards"/>
      <Button color="green">
        Search
      </Button>
    </>
  )
}

export default App
