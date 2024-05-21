import React, { Dispatch, useMemo, useTransition } from 'react';
import { NodeProps } from 'reactflow';
import { Box, Flex, Textarea, useTheme } from '@chakra-ui/react';
import { QuestionOutlineIcon } from '@chakra-ui/icons';
import { FlowNodeItemType } from '@fastgpt/global/core/workflow/type/index.d';
import { welcomeTextTip } from '@fastgpt/global/core/workflow/template/tip';

import QGSwitch from '@/components/core/app/QGSwitch';
import TTSSelect from '@/components/core/app/TTSSelect';
import WhisperConfig from '@/components/core/app/WhisperConfig';
import InputGuideConfig from '@/components/core/chat/appConfig/InputGuideConfig';
import { getAppChatConfig } from '@fastgpt/global/core/workflow/utils';
import { useTranslation } from 'next-i18next';
import { TTSTypeEnum } from '@/web/core/app/constants';
import MyIcon from '@fastgpt/web/components/common/Icon';
import MyTooltip from '@/components/MyTooltip';
import NodeCard from './render/NodeCard';
import ScheduledTriggerConfig from '@/components/core/app/ScheduledTriggerConfig';
import { useContextSelector } from 'use-context-selector';
import { WorkflowContext } from '../../context';
import { AppChatConfigType, AppDetailType, VariableItemType } from '@fastgpt/global/core/app/type';
import { useMemoizedFn } from 'ahooks';
import VariableEdit from '@/components/core/app/VariableEdit';
import { AppContext } from '@/web/core/app/context/appContext';

type ComponentProps = {
  chatConfig: AppChatConfigType;
  setAppDetail: Dispatch<React.SetStateAction<AppDetailType>>;
};

const NodeUserGuide = ({ data, selected }: NodeProps<FlowNodeItemType>) => {
  const theme = useTheme();
  const { appDetail, setAppDetail } = useContextSelector(AppContext, (v) => v);

  const chatConfig = useMemo<AppChatConfigType>(() => {
    return getAppChatConfig({
      chatConfig: appDetail.chatConfig,
      systemConfigNode: data,
      isPublicFetch: true
    });
  }, [data, appDetail]);

  const componentsProps = useMemo(
    () => ({
      chatConfig,
      setAppDetail
    }),
    [chatConfig, setAppDetail]
  );

  return (
    <>
      <NodeCard
        minW={'300px'}
        selected={selected}
        menuForbid={{
          debug: true,
          rename: true,
          copy: true,
          delete: true
        }}
        {...data}
      >
        <Box px={4} py={'10px'} position={'relative'} borderRadius={'md'} className="nodrag">
          <WelcomeText {...componentsProps} />
          <Box pt={4}>
            <ChatStartVariable {...componentsProps} />
          </Box>
          <Box mt={3} pt={3} borderTop={theme.borders.base}>
            <TTSGuide {...componentsProps} />
          </Box>
          <Box mt={3} pt={3} borderTop={theme.borders.base}>
            <WhisperGuide {...componentsProps} />
          </Box>
          <Box mt={3} pt={3} borderTop={theme.borders.base}>
            <QuestionGuide {...componentsProps} />
          </Box>
          <Box mt={3} pt={3} borderTop={theme.borders.base}>
            <ScheduledTrigger {...componentsProps} />
          </Box>
          <Box mt={3} pt={3} borderTop={theme.borders.base}>
            <QuestionInputGuide {...componentsProps} />
          </Box>
        </Box>
      </NodeCard>
    </>
  );
};

export default React.memo(NodeUserGuide);

function WelcomeText({ chatConfig: { welcomeText }, setAppDetail }: ComponentProps) {
  const { t } = useTranslation();
  const [, startTst] = useTransition();

  return (
    <>
      <Flex mb={1} alignItems={'center'}>
        <MyIcon name={'core/modules/welcomeText'} mr={2} w={'14px'} color={'#E74694'} />
        <Box fontWeight={'medium'}>{t('core.app.Welcome Text')}</Box>
        <MyTooltip label={t(welcomeTextTip)} forceShow>
          <QuestionOutlineIcon display={['none', 'inline']} ml={1} />
        </MyTooltip>
      </Flex>
      <Textarea
        className="nodrag"
        rows={6}
        fontSize={'12px'}
        resize={'both'}
        defaultValue={welcomeText}
        bg={'myWhite.500'}
        placeholder={t(welcomeTextTip)}
        onChange={(e) => {
          startTst(() => {
            setAppDetail((state) => ({
              ...state,
              chatConfig: {
                ...state.chatConfig,
                welcomeText: e.target.value
              }
            }));
          });
        }}
      />
    </>
  );
}

function ChatStartVariable({ chatConfig: { variables = [] }, setAppDetail }: ComponentProps) {
  const updateVariables = useMemoizedFn((value: VariableItemType[]) => {
    setAppDetail((state) => ({
      ...state,
      chatConfig: {
        ...state.chatConfig,
        variables: value
      }
    }));
  });

  return <VariableEdit variables={variables} onChange={(e) => updateVariables(e)} />;
}

function QuestionGuide({ chatConfig: { questionGuide = false }, setAppDetail }: ComponentProps) {
  return (
    <QGSwitch
      isChecked={questionGuide}
      size={'md'}
      onChange={(e) => {
        const value = e.target.checked;
        setAppDetail((state) => ({
          ...state,
          chatConfig: {
            ...state.chatConfig,
            questionGuide: value
          }
        }));
      }}
    />
  );
}

function TTSGuide({ chatConfig: { ttsConfig }, setAppDetail }: ComponentProps) {
  return (
    <TTSSelect
      value={ttsConfig}
      onChange={(e) => {
        setAppDetail((state) => ({
          ...state,
          chatConfig: {
            ...state.chatConfig,
            ttsConfig: e
          }
        }));
      }}
    />
  );
}

function WhisperGuide({ chatConfig: { whisperConfig, ttsConfig }, setAppDetail }: ComponentProps) {
  const onChangeNode = useContextSelector(WorkflowContext, (v) => v.onChangeNode);

  return (
    <WhisperConfig
      isOpenAudio={ttsConfig?.type !== TTSTypeEnum.none}
      value={whisperConfig}
      onChange={(e) => {
        setAppDetail((state) => ({
          ...state,
          chatConfig: {
            ...state.chatConfig,
            whisperConfig: e
          }
        }));
      }}
    />
  );
}

function ScheduledTrigger({
  chatConfig: { scheduledTriggerConfig },
  setAppDetail
}: ComponentProps) {
  return (
    <ScheduledTriggerConfig
      value={scheduledTriggerConfig}
      onChange={(e) => {
        setAppDetail((state) => ({
          ...state,
          chatConfig: {
            ...state.chatConfig,
            scheduledTriggerConfig: e
          }
        }));
      }}
    />
  );
}

function QuestionInputGuide({ chatConfig: { chatInputGuide }, setAppDetail }: ComponentProps) {
  const appId = useContextSelector(WorkflowContext, (v) => v.appId);

  return appId ? (
    <InputGuideConfig
      appId={appId}
      value={chatInputGuide}
      onChange={(e) => {
        setAppDetail((state) => ({
          ...state,
          chatConfig: {
            ...state.chatConfig,
            chatInputGuide: e
          }
        }));
      }}
    />
  ) : null;
}
