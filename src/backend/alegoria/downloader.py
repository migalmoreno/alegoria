from gallery_dl.exception import NoExtractorError
from gallery_dl.extractor import find as find_extractor
from gallery_dl import job, config
import os
from abc import ABC, abstractmethod
from typing import Dict


class UnsupportedURLError(Exception):
    pass


class Downloader(ABC):
    def __init__(self, url):
        self.url = url

    @abstractmethod
    def run(self) -> Dict: ...


class GalleryDLDownloader(Downloader):
    def __init__(self, url, batch_mode):
        super().__init__(url)
        self.download_in_batch = batch_mode
        try:
            # for cfg in config:
            #   config.set(cfg)
            # output.initialize_logging(logging.INFO)
            # output.configure_logging(logging.INFO)
            # output.setup_logging_handler("unsupportedfile", fmt="{message}")

            self.extractor = find_extractor(url)
            # self.extractor.config()

            self.job = job.DataJob(self.extractor, file=None)
        except NoExtractorError as e:
            raise UnsupportedURLError(url) from e

    def run(self):
        with open(os.devnull, "w") as f:
            self.job.file = f
            self.job.run()

        if self.job.exception:
            raise self.job.exception

        config.set(("extractor",), "metadata", value=True)

        if self.download_in_batch:
            for idx, url in enumerate(self.job.data_urls):
                with open(os.devnull, "w") as f:
                    j = job.DataJob(url)
                    j.run()

                self.job.data_meta[idx].update(
                    metadata=j.data_meta, post=j.data_post, urls=j.data_urls
                )

        return {
            "metadata": self.job.data_meta,
            "post": self.job.data_post,
            "urls": self.job.data_urls,
            # "data_meta": self.job.metadata,
            # "exception": (
            #     self.job.exception if self.job.exception is not None else None
            # ),
        }


def download_post(url, batch_mode):
    try:
        downloader = GalleryDLDownloader(url, batch_mode)
        return downloader.run()
    except UnsupportedURLError:
        pass
