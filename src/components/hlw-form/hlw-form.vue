<template>
    <n-form
        :ref="setRefs('form')"
        :model="modelValue"
        :rules="rules"
        :label-placement="labelPlacement"
        :label-width="labelWidth"
        :label-align="labelAlign"
        :class="['hlw-form', `is-label-${labelPlacement}`]"
    >
        <section
            v-for="(section, index) in sections"
            :key="section.title || section.desc || index"
            :class="section.title || section.desc ? 'config-section' : 'config-section-flat'"
        >
            <div v-if="section.title || section.desc" class="section-head section-inner">
                <div class="form-section-title">{{ section.title }}</div>
                <span>{{ section.desc }}</span>
            </div>

            <div class="section-inner form-grid">
                <template v-for="item in section.children" :key="key(item)">
                    <div v-if="isInfo(item) && display(item)" :class="item.class">
                        <div class="credential-panel">
                            <div class="credential-title">
                                <ph-key v-if="item.icon === 'key'" :size="16" />
                                <ph-info v-else :size="16" />
                                <span>{{ item.title }}</span>
                            </div>
                            <p class="form-tip no-margin" :class="item.tip.class">
                                {{ item.tip.title }}
                            </p>
                        </div>
                    </div>

                    <n-form-item
                        v-else-if="isField(item) && display(item)"
                        :label="item.label"
                        :path="item.prop"
                        :class="item.class"
                    >
                        <n-radio-group
                            v-if="componentName(item) === 'radio-button'"
                            :value="get(item.prop)"
                            :name="item.prop"
                            @update:value="set(item.prop, $event)"
                        >
                            <n-radio-button
                                v-for="option in componentOptions(item)"
                                :key="option.value"
                                :value="option.value"
                            >
                                {{ option.label }}
                            </n-radio-button>
                        </n-radio-group>

                        <n-input-group v-else-if="item.action">
                            <component
                                :is="componentName(item)"
                                :ref="componentRef(item)"
                                :value="get(item.prop)"
                                v-bind="componentProps(item)"
                                @update:value="set(item.prop, $event)"
                            />
                            <n-button @click="emit('action', item.action.name)">
                                {{ item.action.text }}
                            </n-button>
                        </n-input-group>

                        <component
                            :is="componentName(item)"
                            v-else
                            :ref="componentRef(item)"
                            :value="get(item.prop)"
                            v-bind="componentProps(item)"
                            @update:value="set(item.prop, $event)"
                        />

                        <p v-if="tip(item)" class="form-tip">{{ tip(item) }}</p>
                    </n-form-item>
                </template>
            </div>
        </section>
    </n-form>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRefs } from '../../refs'
import type { Component, VNodeRef } from 'vue'
import type { FormInst, FormItemRule, FormRules } from 'naive-ui'
import { PhInfo, PhKey } from '@phosphor-icons/vue'

type Data = Record<string, any>
type LabelPlacement = 'left' | 'top'
type LabelAlign = 'left' | 'right'

interface Option {
    label: string
    value: string
}

interface ComponentConfig {
    name?: string
    vm?: Component
    props?: Record<string, unknown>
    options?: Option[]
    ref?: VNodeRef
}

interface BaseItem {
    type?: 'field' | 'info'
    prop?: string
    class?: string
    show?: (model: Data) => boolean
}

interface Field extends BaseItem {
    type?: 'field'
    label: string
    prop: string
    component: string | ComponentConfig
    props?: Record<string, unknown>
    options?: Option[]
    required?: boolean
    message?: string
    trigger?: string | string[]
    rules?: FormItemRule[]
    tip?: string | ((model: Data) => string)
    action?: {
        text: string
        name: string
    }
}

interface Info extends BaseItem {
    type: 'info'
    title: string
    tip: {
        title: string
        class?: string
    }
    icon?: 'info' | 'key'
}

interface Section {
    title?: string
    desc?: string
    children: Array<Field | Info>
}

type Item = Section | Field | Info

const props = withDefaults(
    defineProps<{
        modelValue: Data
        items?: Item[]
        labelPlacement?: LabelPlacement
        labelWidth?: number | string
        labelAlign?: LabelAlign
    }>(),
    {
        items: () => [],
        labelPlacement: 'top',
        labelWidth: 86,
        labelAlign: 'left'
    }
)
const emit = defineEmits<{
    'update:modelValue': [value: Data]
    action: [name: string]
}>()
const { refs, setRefs } = useRefs<FormInst>()

const sections = computed<Section[]>(() => {
    if (props.items.every(isSection)) return props.items
    return [
        {
            children: props.items.flatMap((item) => (isSection(item) ? item.children : [item]))
        }
    ]
})
const fields = computed(() =>
    sections.value.flatMap((section) =>
        section.children.filter((item): item is Field => item.type !== 'info')
    )
)
const rules = computed<FormRules>(() => {
    const data: FormRules = {}
    fields.value.forEach((item) => {
        data[item.prop] = [
            ...(item.required
                ? [
                      {
                          required: true,
                          message: item.message || `${item.label}不能为空`,
                          trigger: item.trigger || ['input', 'blur', 'change']
                      }
                  ]
                : []),
            ...(item.rules || [])
        ]
    })
    return data
})

function display(item: Field | Info): boolean {
    return item.show ? item.show(props.modelValue) : true
}

function isInfo(item: Field | Info): item is Info {
    return item.type === 'info'
}

function isField(item: Field | Info): item is Field {
    return item.type !== 'info'
}

function isSection(item: Item): item is Section {
    return 'children' in item
}

function key(item: Field | Info): string {
    return isInfo(item) ? item.title : item.prop
}

function tip(item: Field): string {
    return typeof item.tip === 'function' ? item.tip(props.modelValue) : item.tip || ''
}

function set(prop: string, value: unknown): void {
    const keys = prop.split('.')
    const data = { ...props.modelValue }
    let target = data
    keys.slice(0, -1).forEach((key) => {
        target[key] = { ...target[key] }
        target = target[key]
    })
    target[keys[keys.length - 1]] = value
    emit('update:modelValue', data)
}

function get(prop: string): unknown {
    return prop.split('.').reduce((data, key) => data?.[key], props.modelValue)
}

function configOf(item: Field): ComponentConfig {
    return typeof item.component === 'string' ? { name: item.component } : item.component
}

function componentName(item: Field): string | Component {
    const component = configOf(item)
    return component.vm || component.name || 'n-input'
}

function componentProps(item: Field): Record<string, unknown> {
    return {
        ...(item.props || {}),
        ...(configOf(item).props || {})
    }
}

function componentOptions(item: Field): Option[] {
    return item.options || configOf(item).options || []
}

function componentRef(item: Field): VNodeRef | undefined {
    return configOf(item).ref
}

async function validate(): Promise<void> {
    await refs.value.form?.validate()
}

defineExpose({ validate })
</script>
