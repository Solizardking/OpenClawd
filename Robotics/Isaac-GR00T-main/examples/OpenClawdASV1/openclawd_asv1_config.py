# SPDX-License-Identifier: Apache-2.0
"""GR00T NEW_EMBODIMENT config for OpenClawd ASV1.

This is an integration profile for the OpenClawd Asimov Solana V1 robot. It
keeps the upstream GR00T package unchanged and registers OCASV1 as a custom
embodiment at runtime.
"""

from gr00t.configs.data.embodiment_configs import register_modality_config
from gr00t.data.embodiment_tags import EmbodimentTag
from gr00t.data.types import (
    ActionConfig,
    ActionFormat,
    ActionRepresentation,
    ActionType,
    ModalityConfig,
)


ACTION_HORIZON = 32


openclawd_asv1_config = {
    "video": ModalityConfig(
        delta_indices=[0],
        modality_keys=[
            "front",
            "wrist",
            "head",
        ],
    ),
    "state": ModalityConfig(
        delta_indices=[0],
        modality_keys=[
            "base",
            "left_arm",
            "right_arm",
            "waist_neck",
            "left_leg",
            "right_leg",
            "hands",
            "safety",
        ],
        sin_cos_embedding_keys=[
            "left_arm",
            "right_arm",
            "waist_neck",
            "left_leg",
            "right_leg",
        ],
        mean_std_embedding_keys=[
            "base",
            "safety",
        ],
    ),
    "action": ModalityConfig(
        delta_indices=list(range(0, ACTION_HORIZON)),
        modality_keys=[
            "left_arm",
            "right_arm",
            "waist_neck",
            "left_leg",
            "right_leg",
            "hands",
        ],
        action_configs=[
            ActionConfig(
                rep=ActionRepresentation.RELATIVE,
                type=ActionType.NON_EEF,
                format=ActionFormat.DEFAULT,
                state_key="left_arm",
            ),
            ActionConfig(
                rep=ActionRepresentation.RELATIVE,
                type=ActionType.NON_EEF,
                format=ActionFormat.DEFAULT,
                state_key="right_arm",
            ),
            ActionConfig(
                rep=ActionRepresentation.RELATIVE,
                type=ActionType.NON_EEF,
                format=ActionFormat.DEFAULT,
                state_key="waist_neck",
            ),
            ActionConfig(
                rep=ActionRepresentation.RELATIVE,
                type=ActionType.NON_EEF,
                format=ActionFormat.DEFAULT,
                state_key="left_leg",
            ),
            ActionConfig(
                rep=ActionRepresentation.RELATIVE,
                type=ActionType.NON_EEF,
                format=ActionFormat.DEFAULT,
                state_key="right_leg",
            ),
            ActionConfig(
                rep=ActionRepresentation.ABSOLUTE,
                type=ActionType.NON_EEF,
                format=ActionFormat.DEFAULT,
                state_key="hands",
            ),
        ],
    ),
    "language": ModalityConfig(
        delta_indices=[0],
        modality_keys=["annotation.human.task_description"],
    ),
}


register_modality_config(openclawd_asv1_config, embodiment_tag=EmbodimentTag.NEW_EMBODIMENT)
