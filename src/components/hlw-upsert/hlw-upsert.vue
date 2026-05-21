<template>
    <component :is="box" v-bind="boxProps" v-on="boxEvents">
        <n-form
            :ref="setRefs('form')"
            :model="formData"
            :rules="rules"
            label-placement="top"
            class="hlw-form"
        >
            <section v-for="section in items" :key="section.title || section.desc" class="config-section">
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
                                :value="getForm(item.prop)"
                                :name="item.prop"
                                @update:value="setForm(item.prop, $event)"
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
                                    :value="getForm(item.prop)"
                                    v-bind="componentProps(item)"
                                    @update:value="setForm(item.prop, $event)"
                                />
                                <n-button @click="emit('action', item.action.name)">
                                    {{ item.action.text }}
                                </n-button>
                            </n-input-group>

                            <component
                                :is="componentName(item)"
                                v-else
                                :ref="componentRef(item)"
                                :value="getForm(item.prop)"
                                v-bind="componentProps(item)"
                                @update:value="setForm(item.prop, $event)"
                            />

                            <p v-if="tip(item)" class="form-tip">{{ tip(item) }}</p>
                        </n-form-item>
                    </template>
                </div>
            </section>
        </n-form>

        <template v-if="showOp" #footer>
            <n-button @click="cancel">{{ op.closeButtonText }}</n-button>
            <n-button type="primary" @click="submit">{{ op.saveButtonText }}</n-button>
        </template>
    </component>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRefs } from '../../refs'
import type { Component, VNodeRef } from 'vue'
import type { FormInst, FormItemRule, FormRules } from 'naive-ui'
import { PhInfo, PhKey } from '@phosphor-icons/vue'
import HlwDrawer from '../hlw-drawer/hlw-drawer.vue'
import HlwModal from '../hlw-modal/hlw-modal.vue'

type Data = Record<string, any>
type BoxType = '' | 'drawer' | 'modal'

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

interface OpenOptions {
    title?: string
    type?: 'drawer' | 'modal'
    width?: number | string
    form?: Data
    items?: Section[]
    op?: {
        hidden?: boolean
        saveButtonText?: string
        closeButtonText?: string
    }
    on?: {
        open?: (form: Data) => void
        opened?: (form: Data) => void
        close?: (form: Data) => void
        closed?: (form: Data) => void
        submit?: (form: Data, tools: { close: () => void; done: () => void }) => void | Promise<void>
    }
}

const props = withDefaults(
    defineProps<{
        modelValue?: Data
        items?: Section[]
        show?: boolean
        title?: string
        type?: 'drawer' | 'modal'
        width?: number | string
    }>(),
    {
        items: () => []
    }
)
const emit = defineEmits<{
    'update:modelValue': [value: Data]
    'update:show': [value: boolean]
    action: [name: string]
    submit: [form: Data]
    cancel: []
    open: [form: Data]
    opened: [form: Data]
    close: [form: Data]
    closed: [form: Data]
}>()

const { refs, setRefs } = useRefs<FormInst>()
const popupVisible = ref(false)
const innerForm = ref<Data>({})
const config = ref<OpenOptions>({})

const formData = computed(() => props.modelValue ?? innerForm.value)
const items = computed(() => config.value.items || props.items)
const boxType = computed<BoxType>(() => config.value.type || props.type || '')
const title = computed(() => config.value.title || props.title || '')
const width = computed(() => config.value.width || props.width)
const op = computed(() => ({
    hidden: config.value.op?.hidden || false,
    saveButtonText: config.value.op?.saveButtonText || '保存',
    closeButtonText: config.value.op?.closeButtonText || '取消'
}))
const showOp = computed(() => !!boxType.value && !op.value.hidden)
const showValue = computed({
    get: () => props.show ?? popupVisible.value,
    set: (value: boolean) => {
        popupVisible.value = value
        emit('update:show', value)
    }
})
const box = computed(() => {
    if (boxType.value === 'drawer') return HlwDrawer
    if (boxType.value === 'modal') return HlwModal
    return 'div'
})
const boxProps = computed(() => {
    if (!boxType.value) return {}
    return {
        show: showValue.value,
        title: title.value,
        width: width.value
    }
})
const boxEvents = computed(() => {
    if (!boxType.value) return {}
    return {
        'update:show': (value: boolean) => (showValue.value = value),
        open: () => call('open'),
        opened: () => call('opened'),
        close: () => call('close'),
        closed: () => call('closed')
    }
})
const fields = computed(() =>
    items.value.flatMap((section) =>
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

function open(options: OpenOptions = {}): void {
    config.value = {
        type: 'drawer',
        ...options
    }
    innerForm.value = { ...(options.form || {}) }
    showValue.value = true
}

function close(): void {
    showValue.value = false
}

function cancel(): void {
    close()
    emit('cancel')
}

async function submit(): Promise<void> {
    await validate()
    const data = getForm()
    await config.value.on?.submit?.(data, { close, done })
    emit('submit', data)
    if (!config.value.on?.submit) close()
}

function done(): void {
    return
}

function clear(): void {
    updateForm({})
}

function reset(): void {
    updateForm({ ...(config.value.form || {}) })
}

function updateForm(data: Data): void {
    if (props.modelValue) emit('update:modelValue', data)
    else innerForm.value = data
}

function setForm(prop: string, value: unknown): void {
    const keys = prop.split('.')
    const data = { ...formData.value }
    let target = data
    keys.slice(0, -1).forEach((key) => {
        target[key] = { ...target[key] }
        target = target[key]
    })
    target[keys[keys.length - 1]] = value
    updateForm(data)
}

function getForm(prop?: string): any {
    if (!prop) return formData.value
    return prop.split('.').reduce((data, key) => data?.[key], formData.value)
}

async function validate(): Promise<void> {
    await refs.value.form?.validate()
}

function call(name: 'open' | 'opened' | 'close' | 'closed'): void {
    const data = getForm()
    config.value.on?.[name]?.(data)
    if (name === 'open') emit('open', data)
    if (name === 'opened') emit('opened', data)
    if (name === 'close') emit('close', data)
    if (name === 'closed') emit('closed', data)
}

function display(item: Field | Info): boolean {
    return item.show ? item.show(formData.value) : true
}

function isInfo(item: Field | Info): item is Info {
    return item.type === 'info'
}

function isField(item: Field | Info): item is Field {
    return item.type !== 'info'
}

function key(item: Field | Info): string {
    return isInfo(item) ? item.title : item.prop
}

function tip(item: Field): string {
    return typeof item.tip === 'function' ? item.tip(formData.value) : item.tip || ''
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

defineExpose({
    form: formData,
    open,
    close,
    done,
    clear,
    reset,
    validate,
    submit,
    getForm,
    setForm
})
</script>

