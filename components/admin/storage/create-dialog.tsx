"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Eye,
  EyeOff,
  TestTube,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { showToast } from "@/lib/utils/toast";
import { useStorageStrategyStore } from "@/lib/store/storage";
import {
  createStorageStrategyFormSchema,
  type CreateStorageStrategyFormData,
} from "@/lib/schema/admin/storage";

interface StorageStrategyCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// 可折叠配置区域组件
interface CollapsibleConfigSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

const CollapsibleConfigSection: React.FC<CollapsibleConfigSectionProps> = ({
  title,
  description,
  children,
  defaultOpen = false,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <CollapsibleTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-between p-0 h-auto hover:bg-transparent"
        >
          <div className="text-left">
            <h4 className="text-base font-medium text-foreground">{title}</h4>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 pt-2 border-l-2 border-muted pl-4">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};

export function StorageStrategyCreateDialog({
  open,
  onOpenChange,
  onSuccess,
}: StorageStrategyCreateDialogProps) {
  const { createStrategy, testS3Connection, isSubmitting, isTesting } =
    useStorageStrategyStore();
  const [showS3Password, setShowS3Password] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    msg: string;
  } | null>(null);

  const form = useForm<CreateStorageStrategyFormData>({
    resolver: zodResolver(createStorageStrategyFormSchema) as any,
    defaultValues: {
      name: "",
      type: "local",
      isEnabled: true,
      s3Config: {
        accessKeyId: "",
        secretAccessKey: "",
        bucket: "",
        region: "",
        endpoint: "",
        baseUrl: "",
        forcePathStyle: false,
        forcePresignedUrl: false,
      },
      localConfig: {
        basePath: "/uploads",
      },
    },
  });

  const watchedType = form.watch("type");

  const handleSubmit = async (data: CreateStorageStrategyFormData) => {
    try {
      const strategyData = {
        name: data.name,
        type: data.type,
        isEnabled: data.isEnabled,
        ...(data.type === "s3" && { s3Config: data.s3Config }),
        ...(data.type === "local" && { localConfig: data.localConfig }),
      };

      const result = await createStrategy(strategyData);
      if (result) {
        showToast.success("创建成功", `存储策略 "${data.name}" 创建成功`);
        form.reset();
        setTestResult(null);
        onSuccess?.();
      }
    } catch (err: unknown) {
      console.error("创建存储策略失败:", err);
    }
  };

  const handleTestConnection = async () => {
    const s3Config = form.getValues("s3Config");
    if (!s3Config) return;

    try {
      const result = await testS3Connection({
        accessKeyId: s3Config.accessKeyId,
        secretAccessKey: s3Config.secretAccessKey,
        bucket: s3Config.bucket,
        region: s3Config.region,
        endpoint: s3Config.endpoint,
        baseUrl: s3Config.baseUrl,
        forcePathStyle: s3Config.forcePathStyle,
        forcePresignedUrl: s3Config.forcePresignedUrl,
      });
      setTestResult(result);
    } catch {
      setTestResult({
        success: false,
        msg: "测试连接时发生错误",
      });
    }
  };

  const handleCancel = () => {
    form.reset();
    setTestResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>新建存储策略</DialogTitle>
          <DialogDescription>
            创建新的存储策略，用于配置图片存储位置
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              {/* 基础配置 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">基础配置</h3>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>策略名称 *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="输入策略名称，如：阿里云OSS、本地存储"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>存储类型 *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择存储类型" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="local">本地存储</SelectItem>
                          <SelectItem value="s3">S3 兼容存储</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {field.value === "local"
                          ? "将图片存储在服务器本地磁盘"
                          : "兼容 AWS S3、阿里云 OSS、腾讯云 COS 等"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">启用策略</FormLabel>
                        <FormDescription>
                          启用后用户可以使用此存储策略
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* 存储配置 */}
              {watchedType === "local" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">本地存储配置</h3>

                  <FormField
                    control={form.control}
                    name="localConfig.basePath"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>存储路径 *</FormLabel>
                        <FormControl>
                          <Input placeholder="/var/www/uploads" {...field} />
                        </FormControl>
                        <FormDescription>
                          服务器上存储文件的绝对路径
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {watchedType === "s3" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">S3 存储配置</h3>
                    {testResult && (
                      <div
                        className={`text-sm px-3 py-1 rounded-full ${
                          testResult.success
                            ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                        }`}
                      >
                        {testResult.msg}
                      </div>
                    )}
                  </div>

                  {/* 基础 S3 配置 */}
                  <div className="space-y-4">
                    <h4 className="text-base font-medium text-foreground">
                      认证信息
                    </h4>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="s3Config.accessKeyId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Access Key ID *</FormLabel>
                            <FormControl>
                              <Input placeholder="AKIA..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="s3Config.secretAccessKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Secret Access Key *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showS3Password ? "text" : "password"}
                                  placeholder="••••••••••••••••"
                                  {...field}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() =>
                                    setShowS3Password(!showS3Password)
                                  }
                                >
                                  {showS3Password ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* 存储配置 */}
                  <div className="space-y-4">
                    <h4 className="text-base font-medium text-foreground">
                      存储配置
                    </h4>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="s3Config.bucket"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>存储桶名称 *</FormLabel>
                            <FormControl>
                              <Input placeholder="my-bucket" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="s3Config.region"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>区域 *</FormLabel>
                            <FormControl>
                              <Input placeholder="us-west-2" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="s3Config.endpoint"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>终端节点 *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://s3.amazonaws.com"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            AWS S3: https://s3.amazonaws.com
                            <br />
                            阿里云 OSS: https://oss-cn-hangzhou.aliyuncs.com
                            <br />
                            腾讯云 COS: https://cos.ap-guangzhou.myqcloud.com
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* 高级配置 - 可折叠 */}
                  <CollapsibleConfigSection
                    title="高级配置"
                    description="可选的高级配置选项"
                    defaultOpen={false}
                  >
                    <FormField
                      control={form.control}
                      name="s3Config.baseUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>自定义域名</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://cdn.example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            可选：用于访问文件的自定义域名
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="s3Config.forcePathStyle"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              强制路径样式
                            </FormLabel>
                            <FormDescription>
                              启用后使用路径样式访问（适用于 MinIO 等）
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="s3Config.forcePresignedUrl"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              强制预签名 URL
                            </FormLabel>
                            <FormDescription>
                              启用后使用预签名 URL 直接从 S3 获取文件，减少服务器负载
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CollapsibleConfigSection>

                  {/* 连接测试 */}
                  <div className="pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleTestConnection}
                      disabled={isTesting}
                      className="w-full sm:w-auto"
                    >
                      {isTesting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <TestTube className="mr-2 h-4 w-4" />
                      )}
                      测试 S3 连接
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </Form>
        </div>

        <DialogFooter className="flex-shrink-0 border-t pt-4 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            取消
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            onClick={form.handleSubmit(handleSubmit)}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            创建策略
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
