import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ToastAction } from '@/components/ui/toast'
import { Toaster } from '@/components/ui/toaster'
import { toast } from '@/components/ui/use-toast'
import { usePostApiKey } from '@/hooks/api/api-keys/usePostApiKey'
import { yupResolver } from '@hookform/resolvers/yup'
import { Copy, Loader } from 'lucide-react'
import { FC, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as Yup from 'yup'

const apiKeyFormSchema = Yup.object({
  name: Yup.string()
    .min(3, `The name is required and must have more than 3 characters`)
    .max(50, `The name must have less than 50 characters`)
    .required(),
})

type ApiKeyFormValues = Yup.InferType<typeof apiKeyFormSchema>

interface AddApiKeyDialogProps {
  open: boolean
  onGeneratedKey: () => void
  onClose: () => Promise<void> | void
}

const GenerateApiKeyDialog: FC<AddApiKeyDialogProps> = ({
  open,
  onGeneratedKey,
  onClose,
}) => {
  const [generatingApiKey, setGeneratingApiKey] = useState(false)
  const [showNewKey, setShowNewKey] = useState(false)
  const [apiKey, setApiKey] = useState<string | undefined>()
  const postApiKey = usePostApiKey()

  const form = useForm<ApiKeyFormValues>({
    resolver: yupResolver(apiKeyFormSchema),
    defaultValues: {
      name: '',
    },
  })

  const handleClose = async () => {
    if (generatingApiKey) return
    await onClose()
    setShowNewKey(false)
    setApiKey(undefined)
    form.reset()
  }

  const handleCopyClick = async () => {
    if (!apiKey) return
    try {
      await navigator.clipboard.writeText(apiKey)
      toast({
        variant: 'success',
        title: 'API Key copied!',
      })
    } catch (error) {
      console.error('Could not copy text: ', error)
      toast({
        variant: 'destructive',
        title: 'Could not copy API Key',
      })
    }
  }

  const handleGenerateApiKey = async (apiKeyFormValues: ApiKeyFormValues) => {
    setGeneratingApiKey(true)
    try {
      const { api_key } = await postApiKey(apiKeyFormValues)
      setApiKey(api_key)
      onGeneratedKey()
      setShowNewKey(true)
      form.reset()
      toast({
        title: 'Secret API key generated!',
        description: `Your secret key was generated successfully.`,
      })
    } catch (error) {
      console.error(`Error generating the API key: ${error}`)
      toast({
        variant: 'destructive',
        title: 'Oops! Something went wrong.',
        description: 'There was a problem generating your secret key.',
        action: (
          <ToastAction
            altText="Try again"
            onClick={() => form.handleSubmit(handleGenerateApiKey)()}
          >
            Try again
          </ToastAction>
        ),
      })
    } finally {
      setGeneratingApiKey(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <h1 className="font-semibold">Generate new secret key</h1>
        </DialogHeader>
        {showNewKey ? (
          <>
            <div className="flex flex-col">
              <p>
                Please save this secret key somewhere safe and accessible. For
                security reasons,{' '}
                <strong>{`you won't be able to view it again`}</strong>{' '}
                {`through your
            Dataherald account. If you lose this secret key, you'll need to
            generate a new one.`}
              </p>
              <div className="py-4 flex gap-2">
                <Input value={apiKey} readOnly />
                <Button onClick={handleCopyClick}>
                  <Copy size={20} />
                </Button>
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleGenerateApiKey)}
              className="space-y-8 grow flex flex-col"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={generatingApiKey}
                        placeholder="My secret key name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="secondary-outline"
                  disabled={generatingApiKey}
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button>
                  {generatingApiKey ? (
                    <>
                      <Loader
                        className="mr-2 animate-spin"
                        size={20}
                        strokeWidth={2.5}
                      />{' '}
                      Generating key...
                    </>
                  ) : (
                    'Generate secrete key'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
      <Toaster />
    </Dialog>
  )
}

export default GenerateApiKeyDialog