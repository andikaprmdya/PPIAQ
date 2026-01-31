# About
URL: /docs/mainsections/about

About sections provide a brief overview of your product or service, highlighting its key features and benefits. They help users understand what your product is about and why they should use it.

***

title: About
description: About sections provide a brief overview of your product or service, highlighting its key features and benefits. They help users understand what your product is about and why they should use it.
root: mainsections
updated: true
-------------

import {ComponentPreview} from "@/components/preview/component-preview";
import {extractSourceCode} from "@/lib/code";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import { Step, Steps } from "fumadocs-ui/components/steps";
import { ComponentSource } from "@/components/preview/component-source";


## About Us 2

<ComponentPreview name="about-us-2" classNameComponentContainer="min-h-[600px]" code={(await extractSourceCode('about-us-2')).code} lang="tsx" fromDocs={true} />

### Installation

<Steps>
  <Step>
    <Tabs items={["npm", "pnpm", "yarn", "bun"]}>
      <Tab>
        ```bash
        npm install framer-motion lucide-react next-themes
        ```
      </Tab>

      <Tab>
        ```bash
        pnpm install framer-motion lucide-react next-themes
        ```
      </Tab>

      <Tab>
        ```bash
        yarn add framer-motion lucide-react next-themes
        ```
      </Tab>

      <Tab>
        ```bash
        bun add framer-motion lucide-react next-themes
        ```
      </Tab>
    </Tabs>
  </Step>

  <Step>
    #### Border Beam

    <ComponentSource code={(await extractSourceCode('border-beam')).code} className="bg-fd-secondary/50" />
  </Step>

  <Step>
    #### Counter

    <ComponentSource code={(await extractSourceCode('counter')).code} className="bg-fd-secondary/50" />
  </Step>

  <Step>
    #### Spotlight

    <ComponentSource code={(await extractSourceCode('spotlight')).code} className="bg-fd-secondary/50" />
  </Step>

  <Step>
    #### Utils

    <ComponentSource code={(await extractSourceCode('utils')).code} className="bg-fd-secondary/50" />
  </Step>
</Steps>
